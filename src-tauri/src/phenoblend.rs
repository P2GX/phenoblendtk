
use std::{collections::HashMap, sync::Arc};

use ontolius::{TermId, io::OntologyLoaderBuilder, ontology::{HierarchyWalks, MetadataAware, OntologyTerms, csr::FullCsrOntology}, term::{MinimalTerm, simple::SimpleTerm}};
use phenopackets::schema::{v1::Interpretation, v2::Phenopacket};


use crate::{hpoa::disease_model::SimpleDiseaseModel, model::{proband::Proband, simple_term::SimpleOntologyTerm}};
use crate::hpoa::disease_model::GeneDiseaseAssociation;

pub struct PhenoblendSingleton {
  // settings: HpoCuratorSettings,
    individual: Proband,
    hpo: Option<Arc<FullCsrOntology>>,
    omim_disease_models:  Option<HashMap<TermId, SimpleDiseaseModel>>,
    gene_to_disease_d: Option<HashMap<TermId, Vec<GeneDiseaseAssociation>>>,
}


impl PhenoblendSingleton {
    pub fn new() -> Self {
        PhenoblendSingleton::default()
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
    

    pub fn set_gene_to_disease(&mut self, g2d: HashMap<TermId, Vec<GeneDiseaseAssociation>>) {
        self.gene_to_disease_d = Some(g2d)
    }

    pub fn ingest_ppkt(&mut self, ppkt: Phenopacket) -> Result<(), String> {
        let proband_id = match ppkt.subject {
            Some(sjt) => sjt.id.clone(),
            None => { return Err(format!("Could not extract subject from phenopacket: {:?}", ppkt));},
        };
        let mut observed_hpo: Vec<TermId> = Vec::new();
        let mut disease_list: Vec<SimpleOntologyTerm> = Vec::new();
        let mut gene_symbol_list: Vec<String> = Vec::new();
        for pf in ppkt.phenotypic_features.iter() {
            if pf.excluded {
                continue;
            }
            let hpo_id = match &pf.r#type {
                Some(oclass) => oclass.id.clone(),
                None => { return Err(format!("Could not extract id from Ontology Class: {:?}", &pf.r#type));},
            };
            let hpo_tid: TermId = hpo_id.parse::<TermId>().map_err(|_| format!("Failed to parse TermId from string '{}'", hpo_id))?;
            observed_hpo.push(hpo_tid);
        }
        for disease in ppkt.diseases {
            let dterm = disease.term.as_ref()
                .ok_or_else(|| format!("Could not extract term from disease: {:?}", disease))?;
            let sterm = SimpleOntologyTerm::new(dterm.id.as_str(), dterm.label.as_str())?;
            disease_list.push(sterm);
        }
        for interpretation in ppkt.interpretations {
            if let Some(symbol) = ga4ghphetools::ppkt::get_gene_symbol_from_interpretation(&interpretation) {
                gene_symbol_list.push(symbol);
            }
        }
        let proband = Proband { 
            id: proband_id, 
            gene_list: gene_symbol_list, 
            disease_list: disease_list, 
            observed_hpos: observed_hpo
        };
        self.individual = proband;
        Ok(())
    }

}



impl Default for PhenoblendSingleton {
    fn default() -> Self {
        Self { 
            individual: Proband::default(),
            hpo: None,
            omim_disease_models: None,
            gene_to_disease_d: None
        }
    }
}