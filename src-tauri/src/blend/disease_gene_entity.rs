use std::{collections::{HashMap, HashSet},  sync::Arc};

use ontolius::{TermId, ontology::{HierarchyQueries, OntologyTerms, csr::FullCsrOntology}, term::MinimalTerm};
use ontolius::ontology::HierarchyWalks;
use tokio::fs::create_dir;
use crate::{blend::dto::{OverlapPlotItem, OverlapPlotPayload, SpreadPlotPayload, UpsetPlotPayload}, hpoa::disease_model::GeneDiseaseAssociation, model::{proband::Proband, simple_term::SimpleOntologyTerm}};
use log::{trace, debug, info, warn, error};

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


    fn debug_print_term(tid: &TermId,
        hpo: Arc<FullCsrOntology>, message: &str) {
            match hpo.term_by_id(tid) {
                Some(t) => { trace!("{}: {} ({})", message, t.name(), tid);},
                None => { trace!("{}: Could not find label for {}", message, tid); }
            }
        }


    /// We consider a term from the phenopacket (tid) and ask if there is an 
    /// exact match in a GeneDisease entity. If the GDE is annotated to the same
    /// term, obviously there is an exact match. By the true path rule, if the 
    /// GDE is annotated to a descendent of the term, then there is also an exact 
    /// match. For instance, if the proband is annotated to "Cataract" and the GDE
    /// is annotated to "Nuclear cataract", then the disease is implicitly also annotated
    /// to "Cataract" and we have an exact match.
     pub fn is_perfect_match(
        ppkt_tid: &TermId,
        gde: &GeneDiseaseEntity,
        hpo: Arc<FullCsrOntology>) -> bool {
            // 1. exact match
            if gde.disease_hpo_ids.contains(ppkt_tid) {
                 trace!(
                        "is_perfect_match term={} disease={} perfect_match={}",
                        ppkt_tid,
                        gde.gene_symbol,
                        ppkt_tid
                    );
                return true;
            }
            // 2. match to a descendent
            for disease_hpo_id in gde.disease_hpo_ids.iter() {
                if hpo.is_descendant_of(disease_hpo_id, ppkt_tid) {
                    trace!(
                        "is_perfect_match term={} disease={} perfect_match={}",
                        ppkt_tid,
                        gde.gene_symbol,
                        disease_hpo_id
                    );
                    return true;
                }
            }
            return false;
    }


    pub fn get_overlap_matrix_payload(
        proband: Proband, 
        gde_list: &Vec<GeneDiseaseEntity>, 
        disease_counts: &HashMap<TermId, usize>,
        hpo: Arc<FullCsrOntology>
    ) -> OverlapPlotPayload {
        let mut term_to_item_d: HashMap<TermId, OverlapPlotItem> = HashMap::new();
        let mut gene_entities: Vec<String> = gde_list
            .iter()
            .map(|gde| gde.gene_symbol.clone())
            .collect();
        gene_entities.sort();
        trace!("get_overlap_matrix_payload");
        trace!("gene_entities {:?}", gene_entities);

        for tid in proband.observed_hpos.iter() {
            for gde in gde_list {
                let pm_item = term_to_item_d
                    .entry(tid.clone())
                    .or_insert_with(|| OverlapPlotItem::new(tid, Arc::clone(&hpo)));
                if Self::is_perfect_match(tid, gde, Arc::clone(&hpo)) {
                    pm_item.add_perfect_match(&gde.gene_symbol);
                } else {
                    let match_score = Self::partial_match_score(tid, gde, Arc::clone(&hpo), disease_counts);
                    pm_item.add_match(&gde.gene_symbol, match_score);
                }
            }
        }
        let rows: Vec<OverlapPlotItem> = term_to_item_d.into_values().collect();
        OverlapPlotPayload { entities: gene_entities, columns: rows }
    }

    pub fn get_upset_plot_payload(
        proband: Proband, 
        gda_map: &HashMap<String, Vec<GeneDiseaseAssociation>>,
        hpo: Arc<FullCsrOntology>
    ) -> Result<UpsetPlotPayload, String> {

        let mut gd_entry_list: Vec<GeneDiseaseEntity> = Vec::new();
        for (symbol, gda_list) in gda_map.into_iter() {
            let gd_entity =   GeneDiseaseEntity::new(gda_list)?;
            gd_entry_list.push(gd_entity);
        }
        Ok(crate::blend::upset_plot::build_upset_payload(&gd_entry_list, &proband, hpo.clone()))
    }


    pub fn get_spread_plot_payload(
        proband: Proband, 
        gda_map: &HashMap<String, Vec<GeneDiseaseAssociation>>,
        hpo: Arc<FullCsrOntology>
    ) -> Result<SpreadPlotPayload, String> {
        let mut gd_entry_list: Vec<GeneDiseaseEntity> = Vec::new();
        for (symbol, gda_list) in gda_map.into_iter() {
            let gd_entity =   GeneDiseaseEntity::new(gda_list)?;
            gd_entry_list.push(gd_entity);
        }
       crate::blend::spread_plot::get_spread_plot_payload(proband, gda_map, hpo)
    }


    ///If the gene is annotated with an ancestor (a broader parent term) rather than the precise term. 
    /// It quantifies the specificity using a ratio of disease annotations:
    pub fn partial_match_score(
        query_hpo:&TermId, 
        gde: &GeneDiseaseEntity,
        hpo: Arc<FullCsrOntology>,
        disease_counts: &HashMap<TermId, usize>) -> f64 {
            let pheno_hpo_count = *disease_counts.get(query_hpo).unwrap_or(&0);
            //trace!("partial_match_score-pheno_hpo_count={}", pheno_hpo_count);
            let mut not_anc = 0;
            if pheno_hpo_count > 0 {
                // Find the maximum disease count among the more specific descendant terms
                let mut max_geno_hpo_count = 0;
                for disease_hpo_id in &gde.disease_hpo_ids {
                    if hpo.is_descendant_of(query_hpo, disease_hpo_id ) {
                        let anc_count = *disease_counts.get(disease_hpo_id).unwrap_or(&0);
                        if anc_count > max_geno_hpo_count {
                            max_geno_hpo_count = anc_count;
                        }
                        trace!(
                        "{} descendant of ? {} (Y/N:{}) count={} pheno_hpo_count={}",
                        disease_hpo_id,
                        query_hpo,
                        hpo.is_descendant_of(query_hpo, disease_hpo_id),
                        disease_counts.get(disease_hpo_id).unwrap_or(&0),
                        pheno_hpo_count
                    );
                    } else {
                        not_anc += 1;
                    }
                    
                }
                trace!("Not ancester {}", not_anc);
                println!("max_geno_hpo_count={}", max_geno_hpo_count);
                let score = pheno_hpo_count  as f64 /  max_geno_hpo_count as f64;
                if score > 0 as f64{
                    trace!("score={}", score);
                }
                
                score
            } else {
                0.0
            }
    }




}


