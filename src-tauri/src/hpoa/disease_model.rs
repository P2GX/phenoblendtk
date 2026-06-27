use std::collections::HashSet;

use ontolius::TermId;



pub struct SimpleDiseaseModel {
    omim_disease_id: TermId,
    omim_disease_name: String,
    observed_hpo_ids: HashSet<TermId>,
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
}