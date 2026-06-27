use ontolius::{Identified, TermId};
use serde::{Serialize, Serializer};


#[derive(Serialize, Debug, Clone)]
pub struct SimpleOntologyTerm {
     #[serde(serialize_with = "serialize_term_id")]
    pub term_id: TermId,
    pub term_label: String
}

// A short helper function to cleanly serialize TermId objects via their string representation
fn serialize_term_id<S>(term_id: &TermId, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    serializer.serialize_str(&term_id.to_string())
}

impl SimpleOntologyTerm {
    pub fn new(tid: impl Into<String>, label: impl Into<String>) -> Result<Self, String> {
        let s = tid.into();
        let trmid: TermId = s.parse().map_err(|_| format!("Failed to parse TermId from string '{}'.", s))?;
        Ok(Self {
            term_id: trmid,
            term_label: label.into()
        })
    }

    pub fn term_id_as_string(&self) -> String {
        self.term_id.identifier().to_string()
    }
}