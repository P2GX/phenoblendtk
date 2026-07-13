use std::collections::HashMap;
use ontolius::TermId;
use rand::Rng;
use serde::Serialize;
use statrs::distribution::{Discrete, DiscreteCDF, Hypergeometric};

use super::annotation_source::AnnotationSource;
use super::melded_ppkt::MeldedPpkt;
use super::wallenius::wallenius_sample;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum Method {
    Unweighted,
    Frequency,
}

/// Result of one enrichment test run, ready to hand to the GUI.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EnrichmentResult {
    /// pmf[k] = P(duo count == k) under the null, for k in 0..=m_eff.
    pub pmf: Vec<f64>,
    pub p_value: f64,
    /// True if n_obs_union >= n_union: the draw would exhaust the urn,
    /// making the null deterministic. Worth surfacing in the GUI rather
    /// than silently reporting a p-value for a degenerate test.
    pub degenerate: bool,
}

pub struct EnrichmentTest {
    pub method: Method,
    pub n_sim: usize,
}

impl EnrichmentTest {
    pub fn new(method: Method, n_sim: usize) -> Self {
        Self { method, n_sim }
    }

    fn weights(&self, m: &MeldedPpkt, source: &impl AnnotationSource) -> HashMap<TermId, f64> {
        let union_terms = m.union_terms();
        match self.method {
            Method::Unweighted => union_terms.into_iter().map(|t| (t, 1.0)).collect(),
            Method::Frequency => union_terms
                .into_iter()
                .map(|t| {
                    let f = m.term_frequency(&t, source);
                    (t, f)
                })
                .collect(),
        }
    }

    /// Returns `None` only for FREQUENCY when the urn has no positive
    /// weight at all (mirrors the Python `nan` short-circuit) — the caller
    /// should treat this as "skip, insufficient frequency data" rather
    /// than an error.
    pub fn run(
        &self,
        m: &MeldedPpkt,
        source: &impl AnnotationSource,
        rng: &mut impl Rng,
    ) -> Option<EnrichmentResult> {
        let shared = m.shared_terms();
        let n_union = m.n_union();
        let n_shared = m.n_shared();
        let n_obs_union = m.n_obs_union();
        let n_obs_shared = m.n_obs_shared();
        let m_eff = n_obs_union.min(n_union);
        let degenerate = n_obs_union >= n_union;

        match self.method {
            Method::Unweighted => {
                let dist = Hypergeometric::new(n_union as u64, n_shared as u64, m_eff as u64)
                    .ok()?;
                let pmf: Vec<f64> = (0..=m_eff).map(|k| dist.pmf(k as u64)).collect();
                let p_value = if n_obs_shared == 0 {
                    1.0
                } else {
                    1.0 - dist.cdf((n_obs_shared - 1) as u64)
                };
                Some(EnrichmentResult { pmf, p_value, degenerate })
            }
            Method::Frequency => {
                let weights = self.weights(m, source);
                if !weights.values().any(|&w| w > 0.0) {
                    return None;
                }
                let mut counts = vec![0usize; m_eff + 1];
                for _ in 0..self.n_sim {
                    let sampled = wallenius_sample(&weights, m_eff, rng);
                    let hits = sampled.iter().filter(|t| shared.contains(*t)).count();
                    counts[hits] += 1;
                }
                let pmf: Vec<f64> = counts.iter().map(|&c| c as f64 / self.n_sim as f64).collect();
                let tail: usize = counts[n_obs_shared..].iter().sum();
                // add-one smoothing: never report an exact-zero p-value
                let p_value = (tail as f64 + 1.0) / (self.n_sim as f64 + 1.0);
                Some(EnrichmentResult { pmf, p_value, degenerate })
            }
        }
    }
}