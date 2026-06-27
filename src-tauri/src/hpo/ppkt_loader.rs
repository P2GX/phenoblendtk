use serde::{Deserialize, Serialize};
use serde_json::Value;

// If you have explicit domain models or use an HPO/Phenopacket crate:
#[derive(Serialize, Deserialize, Debug)]
pub struct PhenopacketPayload {
    id: String,
    // Add other fields according to GA4GH spec, or use fallback values
    subject: Option<Value>,
    phenotypic_features: Option<Vec<Value>>,
}


