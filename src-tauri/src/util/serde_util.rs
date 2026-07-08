use std::collections::HashSet;

use ontolius::TermId;
use serde::{Deserialize, Serialize, Serializer};
use serde::de::Error;
use serde::de::{Deserializer, SeqAccess, Visitor};
use std::fmt;



// Custom deserializer helper function:
pub fn parse_term_id<'de, D>(deserializer: D) -> Result<TermId, D::Error>
where
    D: serde::Deserializer<'de>,
{
    let s = String::deserialize(deserializer)?;
    let tid: TermId = s.parse().map_err(|e| {
        D::Error::custom(format!("Failed to parse TermId from string '{}': {}", s, e))
    })?;
    Ok(tid) // Or TermId::new(s) depending on your implementation
}


pub fn serialize_term_id<S>(term_id: &TermId, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    serializer.serialize_str(&term_id.to_string())
}

pub fn serialize_term_id_set<S>(term_ids: &HashSet<TermId>, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    use serde::ser::SerializeSeq;
    let mut seq = serializer.serialize_seq(Some(term_ids.len()))?;
    for id in term_ids {
        seq.serialize_element(&id.to_string())?;
    }
    seq.end()
}



pub fn deserialize_term_id_set<'de, D>(deserializer: D) -> Result<HashSet<TermId>, D::Error>
where
    D: Deserializer<'de>,
{
    // Define a Visitor struct to handle the sequence parsing sequence
    struct TermIdSetVisitor;

    impl<'de> Visitor<'de> for TermIdSetVisitor {
        type Value = HashSet<TermId>;

        fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
            formatter.write_str("a sequence of HPO TermId strings")
        }

        fn visit_seq<A>(self, mut seq: A) -> Result<Self::Value, A::Error>
        where
            A: SeqAccess<'de>,
        {
            let mut set = HashSet::with_capacity(seq.size_hint().unwrap_or(0));

            // Iterate over every element in the JSON array
            while let Some(s) = seq.next_element::<String>()? {
                // Parse the string into a TermId using your implementation's FromStr / parse
                let tid: TermId = s.parse().map_err(|e| {
                    serde::de::Error::custom(format!(
                        "Failed to parse TermId from set element '{}': {}", 
                        s, e
                    ))
                })?;
                set.insert(tid);
            }

            Ok(set)
        }
    }

    // Pass our visitor to the deserializer
    deserializer.deserialize_seq(TermIdSetVisitor)
}