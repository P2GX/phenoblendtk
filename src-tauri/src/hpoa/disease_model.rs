use std::collections::HashSet;
use serde::{Deserialize, Serialize, Serializer};
use serde::de::Error;
use ontolius::{Identified, TermId};


#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SimpleDiseaseModel {
    #[serde(serialize_with = "serialize_term_id")]
    pub omim_disease_id: TermId,
    pub omim_disease_name: String,
     #[serde(serialize_with = "serialize_term_id_set")]
    pub observed_hpo_ids: HashSet<TermId>,
    #[serde(serialize_with = "serialize_term_id_set")]
    excluded_hpo_ids: HashSet<TermId>
}

fn serialize_term_id<S>(term_id: &TermId, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    serializer.serialize_str(&term_id.to_string())
}

fn serialize_term_id_set<S>(term_ids: &HashSet<TermId>, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    use serde::ser::SerializeSeq;
    let mut seq = serializer.serialize_seq(Some(term_ids.len()))?;
    for id in term_ids {
        seq.serialize_element(&id.to_string())?;
    }
    seq.end()
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

    /// Fall back in case we cannot find the disease model, which should never happen
    pub fn from_id(omim_disease_id: TermId) -> Self {
        Self { 
            omim_disease_id, 
            omim_disease_name: "Could not find disease model".to_string(), 
            observed_hpo_ids: HashSet::default(), 
            excluded_hpo_ids: HashSet::default() 
        }
    }

    pub fn omim_id(&self) -> String {
        self.omim_disease_id.identifier().to_string()
    }
}


#[derive(Clone, Debug,  Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GeneDiseaseAssociation {
    pub ncbi_gene_id: String,
    pub gene_symbol: String,
    pub association_type: String,
    #[serde(deserialize_with = "parse_term_id", serialize_with="serialize_term_id")]
    pub disease_id: TermId, 
    pub disease_model: Option<SimpleDiseaseModel>,
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

