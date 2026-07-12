use std::{collections::HashMap, sync::Arc};
use ontolius::{TermId, ontology::{OntologyTerms, csr::FullCsrOntology}, term::MinimalTerm};
use serde::{Serialize, Deserialize};

/// Represents the scores for one HPO term in the presence matrix
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct OverlapPlotItem {
    pub hpo_id: String,
    pub hpo_name: String,
    /// A map matching gene symbols to their calculated matrix match scores [0.0 - 1.0]
    pub scores: HashMap<String, f64>,
}

impl OverlapPlotItem {
    pub fn new(hpo_id: &TermId, hpo: Arc<FullCsrOntology>) -> Self {
        let term = hpo.term_by_id(hpo_id);
        let label = match term {
            Some(t) => t.name().to_string(),
            None => "n/a".to_string() // should never happen
        };
        println!("OverlapPlotItem::new {}-{}", label, hpo_id);
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
pub struct OverlapPlotPayload {
    /// Ordered array of gene symbols or diseases following column sorting block rules
    pub entities: Vec<String>,
    /// Ordered rows following phenotype grouping tiers
    pub columns: Vec<OverlapPlotItem>,
}


impl OverlapPlotPayload {
    pub fn n_columns(&self) -> usize {
        self.columns.len()
    }
}


#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpsetPlotPayload {
    /// The unique gene symbols being evaluated (e.g., ["MBNL1", "DMPK"])
    pub genes: Vec<String>,
    
    /// List of combinations, where each combination is a subset of gene symbols
    pub combinations: Vec<Vec<String>>,
    
    /// Total annotated HPO term intersection sizes per combination (Top-Right background bars)
    pub combination_annotated: Vec<u32>,
    
    /// Subsets of those terms overlapping with patient phenotypes (Top-Right foreground bars)
    pub combination_observed: Vec<u32>,
    
    /// Total annotated HPO term sizes per individual gene (Bottom-Left background bars)
    pub gene_annotated: Vec<u32>,
    
    /// Total terms per individual gene overlapping with patient phenotypes (Bottom-Left foreground bars)
    pub gene_observed: Vec<u32>,
}




#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SpreadPlotCategory {
    pub id: String,
    pub name: String,
    /// Optional field mapping to `alias?: string`
    pub alias: Option<String>,
    /// Patient/Phenopacket fraction (`ppktValue`)
    pub ppkt_value: f64,
    /// Array of values for each gene combo/series (`geneValues`)
    pub gene_values: Vec<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SpreadPlotPayload {
    /// e.g., ["Ppkt", "MBNL1", "DMPK", "MBNL1+DMPK"]
    pub series_labels: Vec<String>,
    pub categories: Vec<SpreadPlotCategory>,
}