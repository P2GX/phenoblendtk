use std::collections::HashSet;
use serde::{Deserialize, Serialize};
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


#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GeneDiseaseAssociation {
    pub ncbi_gene_id: String,
    pub gene_symbol: String,
    pub association_type: String,
    #[serde(deserialize_with = "parse_term_id", serialize_with="serialize_term_id")]
    pub disease_id: TermId, 
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

fn serialize_term_id<S>(term_id: &TermId, serializer: S) -> Result<S::Ok, S::Error>
where
    S: serde::Serializer,
{
    serializer.serialize_str(&term_id.to_string())
}


#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GeneModel {
    pub gene_symbol: String,
    pub associations: Vec<GeneDiseaseAssociation>
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CaseModel {
    pub case_id: String,
    pub gene_models: Vec<GeneModel>

}