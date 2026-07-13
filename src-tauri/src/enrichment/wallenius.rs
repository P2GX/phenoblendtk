use std::collections::{HashMap, HashSet};
use ontolius::TermId;
use rand::{Rng, RngExt};

/// Efraimidis-Spirakis one-pass weighted reservoir sampling without
/// replacement: draws `m` distinct terms from `weights`, each with
/// probability proportional to its (non-negative) weight.
///
/// Terms with weight <= 0.0 can never be drawn and are excluded up front.
/// This is the Wallenius (sequential) weighted-without-replacement model,
/// used for the FREQUENCY null.
pub fn wallenius_sample(
    weights: &HashMap<TermId, f64>,
    m: usize,
    rng: &mut impl Rng,
) -> HashSet<TermId> {
    let candidates: Vec<(&TermId, f64)> = weights
        .iter()
        .filter(|(_, &w)| w > 0.0)
        .map(|(t, &w)| (t, w))
        .collect();

    let m = m.min(candidates.len());
    if m == 0 {
        return HashSet::new();
    }
    if m == candidates.len() {
        return candidates.into_iter().map(|(t, _)| t.clone()).collect();
    }

    // key_i = ln(u_i) / w_i, with u_i ~ Uniform(0,1). ln(u_i) < 0, so a
    // larger weight divides by a bigger number, giving a key closer to
    // zero (i.e. numerically LARGER among negative values). Keeping the
    // m largest keys is therefore equivalent to weighted-without-
    // replacement sampling.
    let mut keyed: Vec<(f64, &TermId)> = candidates
        .into_iter()
        .map(|(t, w)| {
            let u: f64 = rng.random_range(f64::EPSILON..1.0); // avoid ln(0)
            (u.ln() / w, t)
        })
        .collect();

    keyed.sort_by(|a, b| b.0.partial_cmp(&a.0).expect("no NaN keys"));
    keyed.into_iter().take(m).map(|(_, t)| t.clone()).collect()
}