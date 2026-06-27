use ontolius::TermId;

use crate::model::simple_term::SimpleOntologyTerm;



pub struct Proband {
    pub id: String,
    pub gene_list: Vec<String>,
    pub disease_list: Vec<SimpleOntologyTerm>,
    pub observed_hpos: Vec<TermId>
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