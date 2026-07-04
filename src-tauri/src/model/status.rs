#[derive(serde::Serialize)]
pub struct InitializationStatusDto {
    pub hpo_loaded: bool,
    pub hpo_terms: usize,
    pub hpoa_loaded: bool,
    pub hpoa_diseases: usize,
    pub g2d_loaded: bool,
    pub n_genes: usize,
}