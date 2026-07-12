use std::collections::{HashMap, HashSet};

use log::trace;
use oboannotation::hpo::Frequency::Frequency;
use oboannotation::io::AnnotationLoader;
use oboannotation::hpo::io::{HpoAnnotationLines, HpoAnnotationLoader};
use ontolius::TermId;

use crate::util::errors::PhenoblendError;
use crate::hpoa::disease_model::SimpleDiseaseModel;


use std::sync::LazyLock;
static EXCLUDED_TERM_ID: LazyLock<TermId> = LazyLock::new(|| {
    let tid: TermId  = "HP:0040285".parse().unwrap();
    tid
});

static OMIM_PREFIX: &str = "OMIM";




pub fn load_hpoa_d(fpath_hpoa: &str) -> Result<HashMap<TermId, SimpleDiseaseModel>, PhenoblendError> {
    let loader = HpoAnnotationLoader::default();
    let data: HpoAnnotationLines = loader.load_from_path(fpath_hpoa).map_err(|_| PhenoblendError::hpoa_load_error(fpath_hpoa))?;
    
    let mut model_map: HashMap<TermId, HashSet<TermId>> = HashMap::new();
    let mut disease_id_to_name_d: HashMap<TermId, String> = HashMap::new();
    let mut excluded_map: HashMap<TermId, HashSet<TermId>> = HashMap::new();
    let mut simple_model_d: HashMap<TermId, SimpleDiseaseModel> = HashMap::new();
    for line in data.lines {
        let disease_id = line.disease_id;
        if disease_id.prefix().to_string() != OMIM_PREFIX {
            continue;
        }
        let disease_name = line.disease_name;
        let hpo_term_id = line.phenotype_term_id;
        
        let freq = line.frequency.map_or(1.0, |f| match f {
            oboannotation::hpo::Frequency::TermId(term_id) if term_id == *EXCLUDED_TERM_ID => 0.0,
            oboannotation::hpo::Frequency::TermId(_) => 1.0,
            oboannotation::hpo::Frequency::Ratio { numerator, denominator } => (numerator / denominator) as f64,
            Frequency(freq) => freq,
        });
        
        if freq > 0.0 {
            model_map
                .entry(disease_id.clone())
                .or_insert_with(HashSet::new)
                .insert(hpo_term_id.clone());
            if hpo_term_id.to_string() == "HP:0000997" {
                trace!(
                    "Loaded {} with term {} freq {}",
                    disease_id,
                    hpo_term_id,
                    freq
                );
            }
        } else {
            excluded_map
                .entry(disease_id.clone())
                .or_insert_with(HashSet::new)
                .insert(hpo_term_id.clone());
        }
        disease_id_to_name_d.entry(disease_id.clone()).or_insert(disease_name);
    }
    
    // Iterate through everything that ended up with a positive frequency allocation
    for (disease_id, positive_terms) in &model_map {
        if let Some(excluded_terms) = excluded_map.get_mut(disease_id) {
            // Remove terms from the excluded set if they also exist in the positive set
            excluded_terms.retain(|term| !positive_terms.contains(term));
        }
    }
    // Clean up empty disease entries from the excluded map entirely
    excluded_map.retain(|_, terms| !terms.is_empty());
    // Create the final objects
    for (disease_id, positive_terms) in model_map {
        let excluded_terms = excluded_map.remove(&disease_id).unwrap_or_default();
        let disease_name = disease_id_to_name_d
            .remove(&disease_id)
            .ok_or_else(|| PhenoblendError::missing_metadata(format!("Missing name for {}", disease_id)))?;
    
        let model = SimpleDiseaseModel::new(
            disease_id.clone(), 
            disease_name, 
            positive_terms,     
            excluded_terms
        );
        simple_model_d.insert(disease_id.clone(), model);
    }
    Ok(simple_model_d)
}