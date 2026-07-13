use std::collections::HashSet;
use ontolius::TermId;

/// Abstracts over wherever gene→term annotations, ontology descendant
/// closures, and disease/frequency data actually live in the app. The real
/// implementation will likely wrap your existing gene-to-disease index plus
/// `SimpleDiseaseModel::term_frequencies` (see hpoa loader). Kept as a trait
/// so the enrichment math can be unit tested without touching the ontology
/// or the HPOA file.
pub trait AnnotationSource {
    /// Direct (sparse, non-propagated) HPO terms annotated to `gene`.
    fn direct_terms_for_gene(&self, gene: &str) -> HashSet<TermId>;

    /// Descendant closure (term + all descendants) of each term in `terms`.
    /// Used ONLY for classifying observed terms (the downward rule) — must
    /// never be used to populate the sampling urn.
    fn descendant_closure(&self, terms: &HashSet<TermId>) -> HashSet<TermId>;

    /// OMIM (or other) disease IDs linked to `gene`.
    fn diseases_for_gene(&self, gene: &str) -> HashSet<TermId>;

    /// Annotation frequency of `term_id` in `disease_id`, if annotated.
    /// In the real implementation this is a lookup into
    /// `SimpleDiseaseModel::term_frequencies` for that disease.
    fn term_frequency_in_disease(&self, disease_id: &TermId, term_id: &TermId) -> Option<f64>;
}

pub trait DescendantsProvider {
    fn term_and_descendants(&self, term_id: &TermId) -> HashSet<TermId>;
}