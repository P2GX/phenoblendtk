use std::collections::{HashMap, BTreeSet};
use std::sync::Arc;
use itertools::Itertools;

use ontolius::TermId;
use ontolius::ontology::{HierarchyQueries, HierarchyWalks, OntologyTerms};
use ontolius::ontology::csr::FullCsrOntology;
use ontolius::term::MinimalTerm;

use crate::blend::disease_gene_entity::GeneDiseaseEntity;
use crate::blend::dto::{SpreadPlotCategory, SpreadPlotPayload};
use crate::hpoa::disease_model::GeneDiseaseAssociation;
use crate::model::proband::Proband;

// Assuming these are defined in your module or scope:
// use crate::models::{SpreadPlotPayload, SpreadPlotCategory, Proband, GeneDiseaseAssociation, GeneDiseaseEntity, FullCsrOntology};

pub fn get_spread_plot_payload(
    proband: Proband, 
    gda_map: &HashMap<String, Vec<GeneDiseaseAssociation>>,
    hpo: Arc<FullCsrOntology>
) -> Result<SpreadPlotPayload, String> {
    
    // 1. Convert incoming raw mappings into clean entities
    let mut gd_entry_list: Vec<GeneDiseaseEntity> = Vec::new();
    let mut genotypes: Vec<String> = Vec::new();
    
    for (symbol, gda_list) in gda_map.iter() {
        let gd_entity = GeneDiseaseEntity::new(gda_list)?;
        gd_entry_list.push(gd_entity);
        genotypes.push(symbol.clone());
    }

    if proband.observed_hpos.is_empty() || genotypes.is_empty() {
        return Err("Phenotypes and genotypes must not be empty.".to_string());
    }

    // 2. Fetch top-level HPO categories (Children of HP:0000118)
    let phenotype_root: TermId = "HP:0000118".parse().map_err(|_| "Could not map root term".to_string())?;
    let categories: Vec<TermId> = hpo.iter_child_ids(&phenotype_root).cloned().collect();
    
    // 3. Compute the Power Set combinations of genotypes
    let mut genes_power_set: Vec<Vec<String>> = Vec::new();
    for size in 1..=genotypes.len() {
        for combo in genotypes.iter().cloned().combinations(size) {
            genes_power_set.push(combo);
        }
    }

    // Map genotype symbols to their original index position for sorting
    let gene_pos_map: HashMap<String, usize> = genotypes.iter()
        .enumerate()
        .map(|(i, g)| (g.clone(), i))
        .collect();

    // 4. Calculate the Patient Profile ("Ppkt") Fractions
    let mut ppkt_counts: HashMap<TermId, f64> = categories.iter().map(|c| (c.clone(), 0.0)).collect();
    for pheno in &proband.observed_hpos {
        for cat in &categories {
            if cat == pheno ||  hpo.is_ancestor_of(cat, pheno) {
                *ppkt_counts.entry(cat.clone()).or_insert(0.0) += 1.0;
            }
        }
    }
    let total_phenotypes = proband.observed_hpos.len() as f64;
    for val in ppkt_counts.values_mut() {
        *val /= total_phenotypes;
    }

    // 5. Calculate Gene & Power Set Combination Fractions
    // Tracks map of label -> Map<Category, Score>
    let mut combo_column_data: HashMap<String, HashMap<TermId, f64>> = HashMap::new();
    let mut labels_power_set: Vec<String> = Vec::new();

    // Mapping entity data for quick terms extraction
    let entity_lookup: HashMap<String, &GeneDiseaseEntity> = genotypes.iter()
        .zip(gd_entry_list.iter())
        .map(|(sym, ent)| (sym.clone(), ent))
        .collect();

    for combo in &genes_power_set {
        // Collect union of terms for the combination
        let mut union_hpos: BTreeSet<TermId> = BTreeSet::new();
        for gene in combo {
            if let Some(entity) = entity_lookup.get(gene) {
                // Assuming entity exposes its associated HPO term IDs via .terms
                for term in &entity.disease_hpo_ids {
                    union_hpos.insert(term.clone());
                }
            }
        }

        // Canonical label construction
        let label = combo.join("+");
        labels_power_set.push(label.clone());

        let mut cat_scores: HashMap<TermId, f64> = categories.iter().map(|c| (c.clone(), 0.0)).collect();
        let denominator = union_hpos.len() as f64;

        if denominator > 0.0 {
            for union_hpo in &union_hpos {
                for cat in &categories {
                    if hpo.is_ancestor_of(cat, union_hpo) || cat == union_hpo {
                        *cat_scores.entry(cat.clone()).or_insert(0.0) += 1.0;
                    }
                }
            }
            for val in cat_scores.values_mut() {
                *val /= denominator;
            }
        } else {
            // Fill with NaN equivalents or 0.0 depending on your fallback choice
            for val in cat_scores.values_mut() {
                *val = std::f64::NAN;
            }
        }
        combo_column_data.insert(label, cat_scores);
    }

    // 6. Python Sort Step 1: Score single genes using dot products with Ppkt
    let mut single_gene_scores: Vec<(String, f64)> = Vec::new();
    for gene in &genotypes {
        let mut score = 0.0;
        if let Some(cat_scores) = combo_column_data.get(gene) {
            for cat in &categories {
                let ppkt_val = ppkt_counts.get(cat).cloned().unwrap_or(0.0);
                let gene_val = cat_scores.get(cat).cloned().unwrap_or(0.0);
                if !gene_val.is_nan() {
                    score += gene_val * ppkt_val;
                }
            }
        }
        single_gene_scores.push((gene.clone(), score));
    }
    // Sort descending by similarity score
    single_gene_scores.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
    let ranked_genes: Vec<String> = single_gene_scores.into_iter().map(|(g, _)| g).collect();

    // 7. Python Sort Step 2: Order larger power set labels using the single-gene ranking hierarchy
    let mut ordered_labels: Vec<String> = Vec::new();
    for size in 1..=ranked_genes.len() {
        for mut combo in ranked_genes.iter().cloned().combinations(size) {
            // Canonical order matches the initial input indices
            combo.sort_by_key(|g| gene_pos_map.get(g).cloned().unwrap_or(0));
            ordered_labels.push(combo.join("+"));
        }
    }

    // 8. Python Sort Step 3: Sort categories descending by their Patient profile value
    let mut sorted_categories = categories.clone();
    sorted_categories.sort_by(|a, b| {
        let a_val = ppkt_counts.get(a).unwrap_or(&0.0);
        let b_val = ppkt_counts.get(b).unwrap_or(&0.0);
        b_val.partial_cmp(a_val).unwrap_or(std::cmp::Ordering::Equal)
    });

    // 9. Build final Payload Struct
    let mut final_categories: Vec<SpreadPlotCategory> = Vec::new();

    for cat_id in sorted_categories {
        let ppkt_val = ppkt_counts.get(&cat_id).cloned().unwrap_or(0.0);
        
        // Map individual values across ordered combinations
        let mut gene_values: Vec<f64> = Vec::new();
        for label in &ordered_labels {
            let val = combo_column_data.get(label)
                .and_then(|m| m.get(&cat_id))
                .cloned()
                .unwrap_or(std::f64::NAN);
            gene_values.push(val);
        }

        let hpo_name = hpo.term_by_id(&cat_id)
            .map(|term| term.name().to_string())
            .unwrap_or_else(|| cat_id.to_string());

        final_categories.push(SpreadPlotCategory {
            id: cat_id.to_string(),
            name: hpo_name,
            alias: None, // Can be mapped to specific UI subsets if needed
            ppkt_value: ppkt_val,
            gene_values,
        });
    }

    // Build finalized front-end label headers array
    let mut series_labels = vec!["Ppkt".to_string()];
    series_labels.extend(ordered_labels);

    Ok(SpreadPlotPayload {
        series_labels,
        categories: final_categories,
    })
}