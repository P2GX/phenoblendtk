
use std::{collections::HashMap, sync::Arc};

use fenominal::{AutoCompleter, Fenominal, FenominalSentence, OntologyMatch};
use ga4ghphetools::{dto::hpo_term_dto::HpoTermDuplet, tauri::load_ontology};
use ga4ghphetools::tauri::models::HierarchyMapItem;
use ontolius::{TermId,  ontology::csr::FullCsrOntology};
use phenopackets::schema::v2::Phenopacket;


use crate::blend::dto::{SpreadPlotPayload, UpsetPlotPayload};
use crate::{blend::dto::PresenceMatrixPayload, hpoa::disease_model::SimpleDiseaseModel, model::{proband::Proband, simple_term::SimpleOntologyTerm}};
use crate::hpoa::disease_model::GeneDiseaseAssociation;
use crate::util::settings::PhenoblendSettings;

pub struct PhenoblendSingleton {
    pub(crate) settings: PhenoblendSettings,
    pub(crate) individual: Proband,
    pub(crate) hpo: Option<Arc<FullCsrOntology>>,
    pub(crate) omim_disease_models:  Option<HashMap<TermId, SimpleDiseaseModel>>,
    pub(crate) gene_to_disease_d: Option<HashMap<String, Vec<GeneDiseaseAssociation>>>,
    pub(crate) disease_count_d: HashMap<TermId, usize>,
    pub(crate) autocompleter: Option<AutoCompleter>
}


impl PhenoblendSingleton {
    pub fn new() -> Self {
        PhenoblendSingleton::default()
    }


    pub fn set_hpo(&mut self, ontology: Arc<FullCsrOntology>, hpo_json_path: &str) {
        self.hpo = Some(ontology.clone());
        self.autocompleter = Some(AutoCompleter::new(ontology.clone()));
        let _ = self.settings.set_hp_json_path(hpo_json_path);
    }

    pub fn get_hpo(&self) -> Option<Arc<FullCsrOntology>> {
        match &self.hpo {
            Some(hpo) => Some(hpo.clone()),
            None => None,
        }
    }



    pub fn set_hpoa_d(&mut self, hpoa_d: HashMap<TermId, SimpleDiseaseModel>, hpoa_path: &str) {
        self.omim_disease_models = Some(hpoa_d);
        let _ = self.calculate_disease_counts();
        let _ = self.settings.set_hpoa_path(hpoa_path);
    }
    

    pub fn set_gene_to_disease(&mut self, g2d: HashMap<String, Vec<GeneDiseaseAssociation>>, g2d_path: &str) {
        self.gene_to_disease_d = Some(g2d);
        let _ = self.settings.set_g2d_path(g2d_path);
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

    pub fn calculate_presence_matrix(
        &mut self, 
        annotations: HashMap<String, Vec<GeneDiseaseAssociation>>
    ) -> Result<PresenceMatrixPayload, String> {
        let hpo = self.hpo.as_ref()
            .ok_or_else(|| "Missing required resource: HPO Ontology".to_string())?;
        
        let proband = self.individual.clone();
        
        let pm = crate::blend::presence_matrix::calculate_presence_matrix(
            hpo.clone(), 
            &annotations, 
            &self.disease_count_d, 
            proband)?;
        Ok(crate::blend::presence_matrix::sort_presence_payload(pm))
    }

    pub fn get_upset_plot_payload(
        &self,
        annotations: HashMap<String, Vec<GeneDiseaseAssociation>>
    )  -> Result<UpsetPlotPayload, String> {
         let hpo = self.hpo.as_ref()
            .ok_or_else(|| "Missing required resource: HPO Ontology".to_string())?;
        
        let proband = self.individual.clone();
        let upset = crate::blend::disease_gene_entity::GeneDiseaseEntity::get_upset_plot_payload(
            proband, 
            &annotations, 
            hpo.clone())?;

        Ok(upset)
    }


    pub fn get_spread_plot_payload(
        &self,
        annotations: HashMap<String, Vec<GeneDiseaseAssociation>>
    ) -> Result<SpreadPlotPayload, String> {
        let hpo = self.hpo.as_ref()
            .ok_or_else(|| "Missing required resource: HPO Ontology".to_string())?;
        
        let proband = self.individual.clone();
        let spread = crate::blend::disease_gene_entity::GeneDiseaseEntity::get_spread_plot_payload(
            proband, 
            &annotations, 
            hpo.clone())?;
            Ok(spread)
  }






        pub fn calculate_disease_counts(&mut self) -> Result<(), String>{
            let mut disease_counts: HashMap<TermId, usize> = HashMap::new();
            if let Some(models) = &self.omim_disease_models {
                for model in models.values() {
                    for hpo_id in &model.observed_hpo_ids {
                        *disease_counts.entry(hpo_id.clone()).or_insert(0) += 1;
                    }
                }
            }
            self.disease_count_d = disease_counts;
            Ok(())
        }
        


    pub fn disease_count(&self, term_id: &TermId) -> usize {
        self.disease_count_d
            .get(term_id)
            .copied()
            .unwrap_or(0)
    }

     /// Provide Strings with TermId - Label that will be used for autocompletion
    /// fenominal functionality
    pub fn search_hpo(&self, query: &str, limit: usize) -> Vec<OntologyMatch> {
        self.autocompleter
            .as_ref()
            .map(|ac| ac.search_hpo(query, limit))
            .unwrap_or_default()
    }


    pub fn get_hpo_parent_and_children_terms(&self, term_id: &str) -> Result<HierarchyMapItem, String> {
        match &self.hpo {
            Some(hpo) => {
                let hm = ga4ghphetools::tauri::parent_child::get_hpo_parent_and_children_terms(term_id, hpo.clone());
                Ok(hm)
            },
            None => Err("Could not retrieve parent/child hierarchy".to_string())
        }
    }

    pub fn mine_clinical_text(
        &self,
        text: &str
     ) -> Result<Vec<FenominalSentence>, String> {
        let hpo = self.hpo.as_ref().ok_or_else(|| "HPO not initialized".to_string())?;
        let fenominal = Fenominal::new(hpo.clone());
        fenominal.mine_sentences(text).map_err(|e|e.to_string())
    }

    pub fn get_modifiers(&self) -> Result<Vec<HpoTermDuplet>, String> {
        let hpo = self.hpo.as_ref().ok_or_else(|| "HPO not initialized".to_string())?;
        ga4ghphetools::hpo::get_modifiers(hpo.clone())
    }

    pub fn perform_hpo_autocomplete(&self, query: String) -> Result<Vec<OntologyMatch>, String> {
        let autocompleter = self.autocompleter.as_ref().ok_or_else(|| "Autocomplete not initialized".to_string())?;
        let n_term_limit = 20;
        Ok(autocompleter.search_hpo(&query, n_term_limit))
    }

    /// Returns all GeneDiseaseAssociation entries for genes whose symbol
    /// starts with `query` (case-insensitive). Since a single gene symbol
    /// can map to multiple diseases, and a query can match multiple gene
    /// symbols, results are flattened across both dimensions.
    pub fn autocomplete_gene_symbol(&self, query: &str, limit: usize) -> Result<Vec<GeneDiseaseAssociation>, String> {
        let map = self.gene_to_disease_d
            .as_ref()
            .ok_or_else(|| "Gene-to-disease map not initialized".to_string())?;
        let disease_map = self.omim_disease_models
            .as_ref()
            .ok_or_else(|| "disease models map n ot initialized!".to_string())?;

        let trimmed = query.trim();
        if trimmed.is_empty() {
            return Ok(vec![]);
        }

        let query_lower = trimmed.to_lowercase();

        let mut matches: Vec<GeneDiseaseAssociation> = map
            .iter()
            .filter(|(gene_symbol, _)| gene_symbol.to_lowercase().starts_with(&query_lower))
            .flat_map(|(_, associations)| associations.iter().cloned())
            .collect();

        for m in &mut matches {
            match disease_map.get(&m.disease_id) {
                Some(simple_disease) => {
                    m.disease_model = Some(simple_disease.clone());
                }
                None => {
                    m.disease_model = Some(SimpleDiseaseModel::from_id(m.disease_id.clone()));
                }
            }
        }

        matches.sort_by(|a, b| {
            a.gene_symbol.cmp(&b.gene_symbol)
                .then_with(|| a.disease_id.to_string().cmp(&b.disease_id.to_string()))
        });

        matches.truncate(limit);

        Ok(matches)
    }

}






impl Default for PhenoblendSingleton {
    fn default() -> Self {
        let settings = PhenoblendSettings::load_settings();
        let mut singleton = Self { 
            settings: settings.clone(),
            individual: Proband::default(),
            hpo: None,
            omim_disease_models: None,
            gene_to_disease_d: None,
            disease_count_d: HashMap::new(),
            autocompleter: None
        };
       if let Some(ontology) = settings.get_hp_json_path().ok().and_then(|path| load_ontology(&path).ok()) {
            singleton.hpo = Some(ontology.clone());
            let ac = AutoCompleter::new(ontology.clone());
            singleton.autocompleter = Some(ac);
        } else {
            println!("Did not get ontology");
            println!("Oath: {:?}", settings.get_hp_json_path());
        }
        if let Some(omim_map) = settings.get_hpoa_path().ok().and_then(|path| crate::hpoa::hpoa_ingest::load_hpoa_d(&path).ok()) {
            singleton.omim_disease_models = Some(omim_map);
        }
        if let Some(g2d) = settings.get_g2d_path().ok().and_then(|path| crate::hpoa::gene_to_disease::load_gene_disease_associations(&path).ok()) {
            singleton.gene_to_disease_d = Some(g2d);
        }
        singleton
    }
}