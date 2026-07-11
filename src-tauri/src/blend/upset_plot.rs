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

    // Build the combination-level observed filter set (includes term ancestors)
    let mut combo_observed_set = observed_phenotypes.clone();
    for hpo_id in &observed_phenotypes {
        let anc_terms: HashSet<TermId> = hpo.iter_term_and_ancestor_ids(hpo_id).cloned().collect();
        combo_observed_set.extend(anc_terms);
    }

    // Precompute an ancestor-propagated closure per entity, once, up front.
    // This is the ontology-aware counterpart to `combo_observed_set` above:
    // an entity "covers" a broader term if any of its specific annotations
    // is that term or a more specific descendant of it.
    let expanded_terms: Vec<HashSet<TermId>> = entities
        .iter()
        .map(|e| {
            let mut set = e.disease_hpo_ids.clone();
            for term_id in &e.disease_hpo_ids {
                let anc_terms: HashSet<TermId> = hpo.iter_term_and_ancestor_ids(term_id).cloned().collect();
                set.extend(anc_terms);
            }
            set
        })
        .collect();

    // Collect per-gene marginal statistics (Bottom-Left Graph arrays).
    // These stay based on raw, specific terms — not propagated — since
    // they represent "how many phenotypes is this gene's disease annotated with,"
    // not an ontology-aware overlap calculation.
    let mut gene_annotated = Vec::new();
    let mut gene_observed = Vec::new();

    for entity in entities {
        gene_annotated.push(entity.disease_hpo_ids.len() as u32);

        let observed_count = entity.disease_hpo_ids
            .intersection(&observed_phenotypes)
            .count() as u32;
        gene_observed.push(observed_count);
    }

    // Compute exclusive combinations (Top-Right Matrix and Stacked Bars),
    // now using the ancestor-propagated `expanded_terms` sets rather than
    // raw `disease_hpo_ids`, so two diseases sharing a common ancestor term
    // (even via different specific leaf annotations) count as overlapping.
    let mut combinations = Vec::new();
    let mut combination_annotated = Vec::new();
    let mut combination_observed = Vec::new();

    let n_genes = entities.len();

    for size in 1..=n_genes {
        for combo_indices in (0..n_genes).combinations(size) {
            let (included, excluded): (Vec<_>, Vec<_>) = (0..n_genes)
                .partition(|idx| combo_indices.contains(idx));

            // Calculate intersection of all included entities' propagated term sets
            let mut shared_terms = expanded_terms[included[0]].clone();
            for &idx in included.iter().skip(1) {
                shared_terms = shared_terms
                    .intersection(&expanded_terms[idx])
                    .cloned()
                    .collect();
            }

            // Exclude terms that are also covered by any gene NOT in this combination
            for &idx in &excluded {
                shared_terms = shared_terms
                    .difference(&expanded_terms[idx])
                    .cloned()
                    .collect();
            }

            if !shared_terms.is_empty() {
                let combo_symbols: Vec<String> = included
                    .iter()
                    .map(|&idx| entities[idx].gene_symbol.clone())
                    .collect();

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