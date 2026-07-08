use std::{collections::HashMap, sync::Arc};
use ontolius::{TermId, ontology::{OntologyTerms, csr::FullCsrOntology}, term::MinimalTerm};
use serde::{Serialize, Deserialize};

/// Represents the scores for one HPO term in the presence matrix
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PresenceMatrixItem {
    pub hpo_id: String,
    pub hpo_name: String,
    /// A map matching gene symbols to their calculated matrix match scores [0.0 - 1.0]
    pub scores: HashMap<String, f64>,
}

impl PresenceMatrixItem {
    pub fn new(hpo_id: &TermId, hpo: Arc<FullCsrOntology>) -> Self {
        let term = hpo.term_by_id(hpo_id);
        let label = match term {
            Some(t) => t.name().to_string(),
            None => "n/a".to_string() // should never happen
        };
        Self {
            hpo_id: hpo_id.to_string(),
            hpo_name: label,
            scores: HashMap::default()
        }
    }

    pub fn add_perfect_match(&mut self, entity: &str) {
        self.scores.insert(entity.to_string(), 1.0);
    }

    pub fn add_match(&mut self, entity: &str, score: f64) {
        self.scores.insert(entity.to_string(), score);
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PresenceMatrixPayload {
    /// Ordered array of gene symbols or diseases following column sorting block rules
    pub entities: Vec<String>,
    /// Ordered rows following phenotype grouping tiers
    pub columns: Vec<PresenceMatrixItem>,
}


impl PresenceMatrixPayload {
    pub fn n_columns(&self) -> usize {
        self.columns.len()
    }
}