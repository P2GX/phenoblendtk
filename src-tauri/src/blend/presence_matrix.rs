use std::collections::HashMap;
use std::collections::HashSet;
use std::sync::Arc;

use ontolius::ontology::HierarchyQueries;
use ontolius::ontology::HierarchyWalks;
use ontolius::{TermId, ontology::csr::FullCsrOntology};

use crate::blend::disease_gene_entity::GeneDiseaseEntity;
use crate::blend::dto::PresenceMatrixItem;
use crate::blend::dto::PresenceMatrixPayload;
use crate::hpoa::disease_model::GeneDiseaseAssociation;
use crate::hpoa::disease_model::SimpleDiseaseModel;
use crate::model::proband::Proband;

/* 
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
             self.disease_hpo_ids.insert(desc_id.clone());
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

*/

pub fn calculate_presence_matrix(
    hpo: Arc<FullCsrOntology>,
    annotation_map: &HashMap<String, Vec<GeneDiseaseAssociation>>,
    disease_counts: &HashMap<TermId, usize>,
    proband: Proband
) -> Result<PresenceMatrixPayload, String> {

    let mut gd_entry_list: Vec<GeneDiseaseEntity> = Vec::new();
    for (symbol, gda_list) in annotation_map.into_iter() {
        let gd_entity =   GeneDiseaseEntity::new(gda_list)?;
        gd_entry_list.push(gd_entity);
    }
    // Now we have one gene disease entry for each gene. This entry contains
    // HPOs for all of the gene-associated diseases that the user chose in the GUI
    let payload: PresenceMatrixPayload = GeneDiseaseEntity::get_presence_matrix_payload(
        proband,
        &gd_entry_list,
        disease_counts,
        hpo.clone()
    );

    Ok(payload)
}



/// Sorts the columns (gene entities) and rows (PresenceMatrixItem) following the explicit 
/// hierarchal block rules established in the Python pipeline.
pub fn sort_presence_payload(payload: PresenceMatrixPayload) -> PresenceMatrixPayload {
    if payload.entities.is_empty() || payload.columns.is_empty() {
        return payload;
    }
    let n_columns = payload.n_columns();

    // --- 1. Sort Entities (Columns) ---
    // Calculate column sums for each entity
    let mut entity_sums: HashMap<String, f64> = HashMap::new();
    for entity in &payload.entities {
        let sum: f64 = payload.columns.iter()
            .map(|item| item.scores.get(entity).copied().unwrap_or(0.0))
            .sum();
        entity_sums.insert(entity.clone(), sum);
    }

    // Sort entities descending by sum. 
    // Ties fall back to their original position to preserve caller stability.
    let mut sorted_entities = payload.entities.clone();
    sorted_entities.sort_by(|a, b| {
        let sum_a = entity_sums.get(a).unwrap_or(&0.0);
        let sum_b = entity_sums.get(b).unwrap_or(&0.0);
        
        // Descending sort: compare b to a
        sum_b.total_cmp(sum_a)
    });

    // --- 2. Sort Rows (PresenceMatrixItem) ---
    // Track original index positions for stable tie-breaking
    let original_positions: HashMap<String, usize> = payload.columns.iter()
        .enumerate()
        .map(|(i, item)| (item.hpo_id.clone(), i))
        .collect();

    // Group rows into three categories: full, partial, and zero matches
    let mut full_keys: Vec<(isize, Vec<usize>, usize, PresenceMatrixItem)> = Vec::new();
    let mut partial_keys: Vec<(usize, f64, usize, PresenceMatrixItem)> = Vec::new(); // Note: we'll negate the score during total_cmp
    let mut zero_keys: Vec<(usize, PresenceMatrixItem)> = Vec::new();

    for item in payload.columns {
        let input_idx = *original_positions.get(&item.hpo_id).unwrap_or(&0);

        // Find positions of full matches (score == 1.0) in the new sorted entity order
        let full_positions: Vec<usize> = sorted_entities.iter()
            .enumerate()
            .filter(|(_, entity)| {
                let score = item.scores.get(*entity).copied().unwrap_or(0.0);
                (score - 1.0).abs() < f64::EPSILON // Check if exactly 1.0
            })
            .map(|(i, _)| i)
            .collect();

        if !full_positions.is_empty() {
            // Key: (-count of full matches, positions vector, original position)
            let count_key = -(full_positions.len() as isize);
            full_keys.push((count_key, full_positions, input_idx, item));
            continue;
        }

        // Check for partial matches or all zeros
        let mut best_score = 0.0;
        let mut primary_pos = None;

        for (i, entity) in sorted_entities.iter().enumerate() {
            let score = item.scores.get(entity).copied().unwrap_or(0.0);
            if score > best_score {
                best_score = score;
                primary_pos = Some(i);
            }
        }

        if let Some(pos) = primary_pos {
            // Key: (leftmost primary position, best score, original position)
            partial_keys.push((pos, best_score, input_idx, item));
        } else {
            // Key: (original position)
            zero_keys.push((input_idx, item));
        }
    }

    // --- 3. Sorting the buckets ---

    // Full match sorting: by negative length (descending size), then by lexicographical vectors, then stable pos
    full_keys.sort_by(|a, b| {
        match a.0.cmp(&b.0) {
            std::cmp::Ordering::Equal => match a.1.cmp(&b.1) {
                std::cmp::Ordering::Equal => a.2.cmp(&b.2),
                other => other,
            },
            other => other,
        }
    });

    // Partial match sorting: primary pos ascending, best score descending, then stable pos
    partial_keys.sort_by(|a, b| {
        match a.0.cmp(&b.0) {
            std::cmp::Ordering::Equal => match b.1.total_cmp(&a.1) { // Descending sort on float score
                std::cmp::Ordering::Equal => a.2.cmp(&b.2),
                other => other,
            },
            other => other,
        }
    });

    // Zero match sorting: stable position order
    zero_keys.sort_by_key(|k| k.0);

    // --- 4. Reassemble output ---
    let mut sorted_columns = Vec::with_capacity(n_columns);
    
    sorted_columns.extend(full_keys.into_iter().map(|k| k.3));
    sorted_columns.extend(partial_keys.into_iter().map(|k| k.3));
    sorted_columns.extend(zero_keys.into_iter().map(|k| k.1));

    PresenceMatrixPayload {
        entities: sorted_entities,
        columns: sorted_columns,
    }
}