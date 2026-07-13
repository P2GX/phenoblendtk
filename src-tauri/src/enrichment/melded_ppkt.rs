use std::collections::HashSet;
use ontolius::TermId;

use super::annotation_source::AnnotationSource;

/// Result of splitting a phenopacket's observed terms by the downward rule
/// against two genes' descendant closures.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct Categorized {
    pub duo: Vec<TermId>,         // explained by BOTH genes
    pub mono: Vec<TermId>,        // explained by exactly one
    pub unexplained: Vec<TermId>, // explained by neither
}

/// One melded phenopacket: a gene pair plus its observed HPO terms.
///
/// Two spaces, kept deliberately separate (mirrors the Python original):
/// - the SAMPLING space (`union_terms`/`shared_terms`): the DIRECT annotations
///   of gene A and B only. The null draws exclusively from here.
/// - the OBSERVED space (`categorize`): the phenopacket's terms, classified
///   against the descendant closures (a more-specific observed term still
///   counts toward its gene). The observed statistic is a projection onto
///   the direct-annotation space; frequency weighting is meant to absorb
///   that projection, not the urn membership itself.
pub struct MeldedPpkt {
    gene_a: String,
    gene_b: String,
    a_terms: HashSet<TermId>,  // direct/sparse annotations -- the urn
    b_terms: HashSet<TermId>,
    a_dclose: HashSet<TermId>, // classification only, never the urn
    b_dclose: HashSet<TermId>,
    categorized: Categorized,
}

impl MeldedPpkt {
    pub fn new(
        gene_a: impl Into<String>,
        gene_b: impl Into<String>,
        observed: &HashSet<TermId>,
        source: &impl AnnotationSource,
    ) -> Self {
        let gene_a = gene_a.into();
        let gene_b = gene_b.into();
        let a_terms = source.direct_terms_for_gene(&gene_a);
        let b_terms = source.direct_terms_for_gene(&gene_b);
        let a_dclose = source.descendant_closure(&a_terms);
        let b_dclose = source.descendant_closure(&b_terms);
        let categorized = categorize(observed, &a_dclose, &b_dclose);
        Self { gene_a, gene_b, a_terms, b_terms, a_dclose, b_dclose, categorized }
    }

    pub fn gene_a(&self) -> &str { &self.gene_a }
    pub fn gene_b(&self) -> &str { &self.gene_b }

    /// The urn: every term directly annotated to A or B.
    pub fn union_terms(&self) -> HashSet<TermId> {
        self.a_terms.union(&self.b_terms).cloned().collect()
    }

    /// Urn terms explained by BOTH genes under the downward rule (the
    /// hypergeometric "successes", a subset of `union_terms` by construction).
    pub fn shared_terms(&self) -> HashSet<TermId> {
        self.union_terms()
            .into_iter()
            .filter(|t| self.a_dclose.contains(t) && self.b_dclose.contains(t))
            .collect()
    }

    pub fn n_union(&self) -> usize { self.union_terms().len() }
    pub fn n_shared(&self) -> usize { self.shared_terms().len() }

    /// Observed duo terms -- the statistic under test.
    pub fn n_obs_shared(&self) -> usize { self.categorized.duo.len() }

    /// Observed explained terms (duo + mono) -- the draw count.
    /// NOTE: deliberately duo+mono, not mono-only -- see module docs in the
    /// original Python: the draw count must not depend on the duo count
    /// being tested, or the test is miscalibrated.
    pub fn n_obs_union(&self) -> usize {
        self.categorized.duo.len() + self.categorized.mono.len()
    }

    pub fn has_overlap(&self) -> bool { !self.shared_terms().is_empty() }
    pub fn categorize(&self) -> &Categorized { &self.categorized }

    /// Mean annotation frequency of `term` across the union of A's and B's
    /// diseases. Diseases where the term isn't annotated are skipped.
    ///
    /// NOTE (carried over from the Python source): this pools A and B into
    /// one frequency figure. If you need a genuinely per-gene frequency,
    /// this needs a different signature — flagging so it isn't silently
    /// assumed correct.
    pub fn term_frequency(&self, term: &TermId, source: &impl AnnotationSource) -> f64 {
        let diseases: HashSet<TermId> = source
            .diseases_for_gene(&self.gene_a)
            .union(&source.diseases_for_gene(&self.gene_b))
            .cloned()
            .collect();

        let freqs: Vec<f64> = diseases
            .iter()
            .filter_map(|d| source.term_frequency_in_disease(d, term))
            .collect();

        if freqs.is_empty() {
            0.0
        } else {
            freqs.iter().sum::<f64>() / freqs.len() as f64
        }
    }
}

fn categorize(
    observed: &HashSet<TermId>,
    a_dclose: &HashSet<TermId>,
    b_dclose: &HashSet<TermId>,
) -> Categorized {
    let mut duo = Vec::new();
    let mut mono = Vec::new();
    let mut unexplained = Vec::new();

    for o in observed {
        let hits = a_dclose.contains(o) as u8 + b_dclose.contains(o) as u8;
        match hits {
            2 => duo.push(o.clone()),
            1 => mono.push(o.clone()),
            _ => unexplained.push(o.clone()),
        }
    }
    Categorized { duo, mono, unexplained }
}