use std::collections::HashMap;
use std::collections::HashSet;
use std::sync::Arc;

use ontolius::ontology::HierarchyQueries;
use ontolius::ontology::HierarchyWalks;
use ontolius::ontology::OntologyTerms;
use ontolius::term::MinimalTerm;
use ontolius::{TermId, ontology::csr::FullCsrOntology};

use crate::blend::dto::PresenceMatrixItem;
use crate::blend::dto::PresenceMatrixPayload;
use crate::hpoa::disease_model::GeneDiseaseAssociation;
use crate::hpoa::disease_model::SimpleDiseaseModel;
use crate::model::proband::Proband;


struct Entity {
    label: String,
    explicit_annotation_ids: HashSet<TermId>,
    disease_hpo_ids: HashSet<TermId> 
}

impl Entity {
    pub fn new(label: impl Into<String>) -> Self {
        Self {
            label: label.into(),
            explicit_annotation_ids: HashSet::default(),
            // HPO terms of disease plus descendents
            disease_hpo_ids: HashSet::default()
        }
    }

    pub fn add_hpo_id(&mut self, tid: &TermId, hpo:Arc<FullCsrOntology>) {
        self.disease_hpo_ids.insert(tid.clone());
        self.explicit_annotation_ids.insert(tid.clone());
        for desc_id in hpo.iter_descendant_ids(tid) {
             self.disease_hpo_ids.insert(tid.clone());
        }
    }

    pub fn get_matrix(&self, hpo: Arc<FullCsrOntology>, observed_hpos: Vec<TermId>) -> Vec<PresenceMatrixItem> {
        let mut term_to_item_d: HashMap<TermId, PresenceMatrixItem> = HashMap::new();
        for hpo_id in observed_hpos {
            if self.disease_hpo_ids.contains(&hpo_id) {
                let pm_item = term_to_item_d
                    .entry(hpo_id.clone())
                    .or_insert_with(|| PresenceMatrixItem::new(&hpo_id, hpo.clone()));
                pm_item.add_perfect_match(&self.label);
            }
        }

        vec![]
    }

    pub fn is_perfect_match(&self, tid: &TermId) -> bool {
        self.disease_hpo_ids.contains(tid)
    }

    ///If the gene is annotated with an ancestor (a broader parent term) rather than the precise term. 
    /// It quantifies the specificity using a ratio of disease annotations:
    pub fn get_partial_match_score(
        &self, 
        query_hpo:&TermId, 
        hpo: Arc<FullCsrOntology>,
        disease_counts: &HashMap<TermId, usize>) -> f64 {
            let pheno_hpo_count = *disease_counts.get(query_hpo).unwrap_or(&0);

            if pheno_hpo_count > 0 {
                // Find the maximum disease count among the more specific descendant terms
                let mut max_geno_hpo_count = 0;
                for hpo_id in &self.explicit_annotation_ids {
                    if hpo.is_ancestor_of(hpo_id, query_hpo) {
                        let anc_count = *disease_counts.get(hpo_id).unwrap_or(&0);
                        if anc_count > max_geno_hpo_count {
                            max_geno_hpo_count = anc_count;
                        }
                    }
                }
                let score = (max_geno_hpo_count / pheno_hpo_count) as f64;
                score
            } else {
                0.0
            }
    }


}

fn get_gene_entity(
    symbol: &str, 
    hpo: Arc<FullCsrOntology>,
    omim_disease_models: &HashMap<TermId, SimpleDiseaseModel>,
    gene_to_disease_d: &HashMap<String, Vec<GeneDiseaseAssociation>>)
    -> Result<Entity, String> {
        let mut entity = Entity::new(symbol);
        let gda_list = gene_to_disease_d.get(symbol)
            .ok_or_else(|| format!("Could not find disease list for {}", symbol))?;
        for gda in gda_list {
            let disease_id = gda.disease_id.clone();
            let sdm = omim_disease_models.get(&disease_id)
                .ok_or_else(|| format!("Could not find disease for id {}", disease_id))?;
            // These are exact matches between the disease and the ppkt (the disease has the same HPO term or an ancestor)
            for hpo_id in sdm.observed_hpo_ids.iter() {
                entity.add_hpo_id(hpo_id, hpo.clone());
            }
        }
        Ok(entity)
    }


fn calculate_for_genes(proband: Proband, hpo: Arc<FullCsrOntology>,
    omim_disease_models: &HashMap<TermId, SimpleDiseaseModel>,
    gene_to_disease_d: &HashMap<String, Vec<GeneDiseaseAssociation>>) -> Result<Vec<PresenceMatrixPayload>, String> {
        let symbols = proband.gene_list.clone();
        let mut entities: Vec<Entity> = Vec::new();
        for gene in symbols {
            let ent = get_gene_entity(&gene, hpo.clone(), omim_disease_models, gene_to_disease_d)?;
            entities.push(ent);
        }
        let observed_hpos = proband.observed_hpos.clone();

        Ok(vec![])
    }



pub fn calculate_presence_matrix(
    hpo: Arc<FullCsrOntology>,
    omim_disease_models: &HashMap<TermId, SimpleDiseaseModel>,
    gene_to_disease_d: &HashMap<String, Vec<GeneDiseaseAssociation>>,
    disease_counts: &HashMap<TermId, usize>,
    proband: Proband
) -> Result<PresenceMatrixPayload, String> {
    let mut entities: Vec<String> = Vec::new();
    if proband.gene_list.len() >= 2 {
        entities = proband.gene_list.clone();
    } else if proband.disease_list.len() >= 2 {
        entities = proband.disease_list
            .iter()
            .map(|disease| disease.term_id_as_string()) 
            .collect();
    } else {
        return Err(format!("Did not find suffient diseases/genes for analysis"));
    }
    let mut loaded_entities = Vec::new();
    // for now assume genes TODO GENERALIZE
    for symbol in &entities {
        let ent = get_gene_entity(symbol, hpo.clone(), omim_disease_models, gene_to_disease_d)?;
        loaded_entities.push(ent);
    }

    let mut rows = Vec::new();
    // 3. Score every query HPO term across all entities
    for query_hpo in &proband.observed_hpos {
        let mut scores = HashMap::new();

        for entity in &loaded_entities {
            let mut score = 0.0;

            // Check for perfect match (entity has an annotation equal to or a descendant of query_hpo)
            let is_perfect = entity.is_perfect_match(query_hpo);
            if is_perfect {
                score = 1.0;
            } else {
                score = entity.get_partial_match_score(query_hpo, hpo.clone(), disease_counts);
            }
            scores.insert(entity.label.clone(), score);
        }

        rows.push(PresenceMatrixItem {
            hpo_id: query_hpo.to_string(),
            hpo_name: hpo.term_by_id(query_hpo).map(|t| t.name().to_string()).unwrap_or_else(|| query_hpo.to_string()),
            scores,
        });
    }

    // TODO  Implement your row/column sorting logic on `entities` and `rows` here before returning

    Ok(PresenceMatrixPayload {
        entities: entities,
        columns: rows,
    })
}