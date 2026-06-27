use ontolius::TermId;

use serde::{Serialize, Serializer};
use crate::model::simple_term::SimpleOntologyTerm;


#[derive(Serialize, Debug, Clone)]
pub struct Proband {
    pub id: String,
    pub gene_list: Vec<String>,
    pub disease_list: Vec<SimpleOntologyTerm>,
     #[serde(serialize_with = "serialize_term_id_vec")]
    pub observed_hpos: Vec<TermId>
}


fn serialize_term_id_vec<S>(term_ids: &[TermId], serializer: S) -> Result<S::Ok, S::Error>
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

impl Default for Proband {
    
    fn default() -> Self {
      Self {    
        id: String::default(),
        gene_list: Vec::default(),
        disease_list: Vec::default(),
        observed_hpos: Vec::default(),
        }
    }
}