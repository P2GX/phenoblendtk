use crate::enrichment::test::EnrichmentResult;

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DuoEnrichmentSummary {
    pub gene_a: String,
    pub gene_b: String,
    pub n_union: usize,
    pub n_shared: usize,
    pub n_obs_union: usize,
    pub n_obs_shared: usize,
    pub has_overlap: bool,
    pub unweighted: Option<EnrichmentResult>,
    pub frequency: Option<EnrichmentResult>,
}