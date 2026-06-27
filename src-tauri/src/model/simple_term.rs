use ontolius::TermId;



pub struct SimpleOntologyTerm {
    pub term_id: TermId,
    pub term_label: String
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
}