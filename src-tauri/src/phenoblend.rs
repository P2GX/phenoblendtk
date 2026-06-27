
use std::{collections::HashMap, sync::Arc};

use ontolius::{TermId, io::OntologyLoaderBuilder, ontology::{HierarchyWalks, MetadataAware, OntologyTerms, csr::FullCsrOntology}, term::{MinimalTerm}};

use crate::hpoa::disease_model::SimpleDiseaseModel;


pub struct PhenoblendSingleton {
  // settings: HpoCuratorSettings,
    /// Human Phenotype Ontology
    hpo: Option<Arc<FullCsrOntology>>,
    omim_disease_models:  Option<HashMap<TermId, SimpleDiseaseModel>>,
}


impl PhenoblendSingleton {
    /// Create a new instance of PhenoboardSingleton
    /// 
    /// The constructor will try to load the HPO from the settings file if available;
    /// if something does not work, it will leave the ontology field as None
    pub fn new() -> Self {
        let mut singleton = PhenoblendSingleton::default();
        return singleton;
    }


    pub fn set_hpo(&mut self, ontology: Arc<FullCsrOntology>, hpo_json_path: &str) {
        self.hpo = Some(ontology.clone());
      //  let _ = self.settings.set_hp_json_path(hpo_json_path);
    }

    pub fn get_hpo(&self) -> Option<Arc<FullCsrOntology>> {
        match &self.hpo {
            Some(hpo) => Some(hpo.clone()),
            None => None,
        }
    }



    pub fn set_hpoa_d(&mut self, hpoa_d: HashMap<TermId, SimpleDiseaseModel>) {
        self.omim_disease_models = Some(hpoa_d);
    }
    

   

}



impl Default for PhenoblendSingleton {
    fn default() -> Self {
        Self { 
           hpo: None,
           omim_disease_models: Some(HashMap::default()),
        }
    }
}