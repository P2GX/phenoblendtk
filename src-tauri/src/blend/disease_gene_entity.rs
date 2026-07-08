use std::{collections::{HashMap, HashSet},  sync::Arc};

use ontolius::{TermId, ontology::{HierarchyQueries, csr::FullCsrOntology}};
use ontolius::ontology::HierarchyWalks;
use crate::{blend::dto::{PresenceMatrixItem, PresenceMatrixPayload, UpsetPlotPayload}, hpoa::disease_model::GeneDiseaseAssociation, model::{proband::Proband, simple_term::SimpleOntologyTerm}};


/// This is the structure we use for the phenoblend analysis. We have one such entity for each gene, and the entities can have one or more diseases associated with the gene
/// disease_hpo_ids then has all the observed HPO identifiers for all of the diseases
/// individual_explicit_ids has all of the explicit annotations from the phenopacket/case we are analyzing.
#[derive(Debug)]
pub struct GeneDiseaseEntity {
    pub ncbi_gene_id: String,
    pub gene_symbol: String,
    pub disease_list: Vec<SimpleOntologyTerm>,
    pub(crate) disease_hpo_ids: HashSet<TermId> 
}

impl GeneDiseaseEntity {
    pub fn new(gda_list: &Vec<GeneDiseaseAssociation>) -> Result<Self, String> {
        let first_gda = gda_list.first().ok_or("gda_list cannot be empty")?;
        let ncbi_gene_id = first_gda.ncbi_gene_id.clone();
        let gene_symbol = first_gda.gene_symbol.clone();
        
        let mut disease_list = Vec::with_capacity(gda_list.len());
        let mut disease_hpo_ids = HashSet::new();

        for d in gda_list {
            if d.ncbi_gene_id != ncbi_gene_id || d.gene_symbol != gene_symbol {
                return Err("gda_list contains mismatched Gene id/symbol".to_string());
            }
            let model = d.disease_model.clone()
                .ok_or_else(|| format!("Could not find model for gene {}", gene_symbol))?;
            disease_hpo_ids.extend(model.observed_hpo_ids);
            let simple_disease_term = SimpleOntologyTerm::new(
                model.omim_disease_id.to_string(),
                model.omim_disease_name.clone()
            )?;
            disease_list.push(simple_disease_term);
        }
        Ok(Self {
            ncbi_gene_id: ncbi_gene_id,
            gene_symbol: gene_symbol,
            disease_list: disease_list,
            disease_hpo_ids: disease_hpo_ids
        })
    }

    
     pub fn is_perfect_match(
        tid: &TermId,
        gde: &GeneDiseaseEntity,
        hpo: Arc<FullCsrOntology>) -> bool {
            let anc_terms: HashSet<TermId> = hpo.iter_term_and_ancestor_ids(tid).cloned().collect();
            for anc in anc_terms {
                if gde.disease_hpo_ids.contains(&anc) {
                    return true;
                }
            }
            return false;
    }


    pub fn get_presence_matrix_payload(
        proband: Proband, 
        gde_list: &Vec<GeneDiseaseEntity>, 
        disease_counts: &HashMap<TermId, usize>,
        hpo: Arc<FullCsrOntology>
    ) -> PresenceMatrixPayload {
        let mut term_to_item_d: HashMap<TermId, PresenceMatrixItem> = HashMap::new();
        let mut gene_entities: Vec<String> = gde_list
            .iter()
            .map(|gde| gde.gene_symbol.clone())
            .collect();
        gene_entities.sort();

        for tid in proband.observed_hpos.iter() {
            for gde in gde_list {
                let pm_item = term_to_item_d
                    .entry(tid.clone())
                    .or_insert_with(|| PresenceMatrixItem::new(tid, Arc::clone(&hpo)));
                if Self::is_perfect_match(tid, gde, Arc::clone(&hpo)) {
                    pm_item.add_perfect_match(&gde.gene_symbol);
                } else {
                    let match_score = Self::partial_match_score(tid, gde, Arc::clone(&hpo), disease_counts);
                    pm_item.add_match(&gde.gene_symbol, match_score);
                }
            }
        }
        let rows: Vec<PresenceMatrixItem> = term_to_item_d.into_values().collect();
        PresenceMatrixPayload { entities: gene_entities, columns: rows }
    }

    pub fn get_upset_plot_payload(
        proband: Proband, 
        gda_map: &HashMap<String, Vec<GeneDiseaseAssociation>>,
        disease_counts: &HashMap<TermId, usize>,
        hpo: Arc<FullCsrOntology>
    ) -> Result<UpsetPlotPayload, String> {

        let mut gd_entry_list: Vec<GeneDiseaseEntity> = Vec::new();
        for (symbol, gda_list) in gda_map.into_iter() {
            let gd_entity =   GeneDiseaseEntity::new(gda_list)?;
            gd_entry_list.push(gd_entity);
        }
        Ok(crate::blend::upset_plot::build_upset_payload(&gd_entry_list, &proband, hpo.clone()))
    }


    ///If the gene is annotated with an ancestor (a broader parent term) rather than the precise term. 
    /// It quantifies the specificity using a ratio of disease annotations:
    pub fn partial_match_score(
        query_hpo:&TermId, 
        gde: &GeneDiseaseEntity,
        hpo: Arc<FullCsrOntology>,
        disease_counts: &HashMap<TermId, usize>) -> f64 {
            let pheno_hpo_count = *disease_counts.get(query_hpo).unwrap_or(&0);
            if pheno_hpo_count > 0 {
                // Find the maximum disease count among the more specific descendant terms
                let mut max_geno_hpo_count = 0;
                for hpo_id in &gde.disease_hpo_ids {
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


