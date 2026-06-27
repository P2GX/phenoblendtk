use std::collections::HashSet;
use serde::Deserialize;
use serde::de::Error;
use ontolius::{Identified, TermId};



pub struct SimpleDiseaseModel {
    pub omim_disease_id: TermId,
    pub omim_disease_name: String,
    pub observed_hpo_ids: HashSet<TermId>,
    excluded_hpo_ids: HashSet<TermId>
}

impl SimpleDiseaseModel {
    pub fn new(omim_disease_id: TermId,
                omim_disease_name: String,
                observed_hpo_ids: HashSet<TermId>,
                excluded_hpo_ids: HashSet<TermId>)
    -> Self {
        Self {
            omim_disease_id,
            omim_disease_name,
            observed_hpo_ids,
            excluded_hpo_ids
        }
    }

    pub fn omim_id(&self) -> String {
        self.omim_disease_id.identifier().to_string()
    }
}


#[derive(Debug, Deserialize)]
pub struct GeneDiseaseAssociation {
    #[serde(rename = "ncbi_gene_id")]
    pub ncbi_gene_id: String,
    #[serde(rename = "gene_symbol")]
    pub gene_symbol: String,
    #[serde(rename = "association_type")]
    pub association_type: String,
    #[serde(rename = "disease_id", deserialize_with = "parse_term_id")]
    pub disease_id: TermId, 
    #[serde(rename = "source")]
    pub source: String,
}


// Custom deserializer helper function if needed:
fn parse_term_id<'de, D>(deserializer: D) -> Result<TermId, D::Error>
where
    D: serde::Deserializer<'de>,
{
    let s = String::deserialize(deserializer)?;
    let tid: TermId = s.parse().map_err(|e| {
        D::Error::custom(format!("Failed to parse TermId from string '{}': {}", s, e))
    })?;
    Ok(tid) // Or TermId::new(s) depending on your implementation
}