use std::{collections::HashSet, sync::Arc};
use itertools::Itertools;
use ontolius::{TermId, ontology::{HierarchyWalks, csr::FullCsrOntology}};


use crate::{blend::{disease_gene_entity::GeneDiseaseEntity, dto::UpsetPlotPayload}, model::proband::{self, Proband}};



/// Builds the payload for the UpSet plot by calculating intersections and subsets.
/// 
/// # Arguments
/// * `entities` - Slice of GeneDiseaseEntity data to evaluate.
/// * `phenotypes` - The raw observed phenotype TermIds from the phenopacket.
/// * `get_ancestors` - A closure/function providing HPO ancestor lookups.
pub fn build_upset_payload(
    entities: &[GeneDiseaseEntity],
    proband: &Proband,
    hpo: Arc<FullCsrOntology>,
) -> UpsetPlotPayload 
{
    let gene_symbols: Vec<String> = entities.iter().map(|e| e.gene_symbol.clone()).collect();
    let observed_phenotypes: HashSet<TermId> = proband.observed_hpos.iter().cloned().collect();
    // 2. Build the combination-level observed filter set (Includes term ancestors)
    let mut combo_observed_set = observed_phenotypes.clone();
    for hpo_id in &observed_phenotypes {
        let anc_terms: HashSet<TermId> = hpo.iter_term_and_ancestor_ids(hpo_id).cloned().collect();
        combo_observed_set.extend(anc_terms);
    }

    // 3. Collect per-gene marginal statistics (Bottom-Left Graph arrays)
    let mut gene_annotated = Vec::new();
    let mut gene_observed = Vec::new();
    
    for entity in entities {
        gene_annotated.push(entity.disease_hpo_ids.len() as u32);
        
        // Match Python: build_gene_data uses raw un-propagated phenotypes
        let observed_count = entity.disease_hpo_ids
            .intersection(&observed_phenotypes)
            .count() as u32;
        gene_observed.push(observed_count);
    }

    // 4. Compute exclusive combinations (Top-Right Matrix and Stacked Bars)
    let mut combinations = Vec::new();
    let mut combination_annotated = Vec::new();
    let mut combination_observed = Vec::new();

    let n_genes = entities.len();
    
    // Loop through sizes 1..=n_genes matching Python's range(1, len(genotypes) + 1)
    for size in 1..=n_genes {
        // Get all unique combinations of indices of that size
        for combo_indices in (0..n_genes).combinations(size) {
            
            // Separate genes inside the combination from those outside it
            let (included, excluded): (Vec<_>, Vec<_>) = entities
                .iter()
                .enumerate()
                .partition(|(idx, _)| combo_indices.contains(idx));

            // Strip the enumeration indices
            let included: Vec<&GeneDiseaseEntity> = included.into_iter().map(|(_, e)| e).collect();
            let excluded: Vec<&GeneDiseaseEntity> = excluded.into_iter().map(|(_, e)| e).collect();

            // Calculate intersections of all included gene term sets
            let mut shared_terms = included[0].disease_hpo_ids.clone();
            for entity in included.iter().skip(1) {
                shared_terms = shared_terms
                    .intersection(&entity.disease_hpo_ids)
                    .cloned()
                    .collect();
            }

            // Exclude terms that belong to any genes NOT in this combination
            for entity in excluded {
                shared_terms = shared_terms
                    .difference(&entity.disease_hpo_ids)
                    .cloned()
                    .collect();
            }

            // If this exclusive intersection has elements, save the stats
            if !shared_terms.is_empty() {
                let combo_symbols: Vec<String> = included.iter().map(|e| e.gene_symbol.clone()).collect();
                
                let annot_count = shared_terms.len() as u32;
                let obs_count = shared_terms.intersection(&combo_observed_set).count() as u32;

                combinations.push(combo_symbols);
                combination_annotated.push(annot_count);
                combination_observed.push(obs_count);
            }
        }
    }

    UpsetPlotPayload {
        genes: gene_symbols,
        combinations,
        combination_annotated,
        combination_observed,
        gene_annotated,
        gene_observed,
    }
}