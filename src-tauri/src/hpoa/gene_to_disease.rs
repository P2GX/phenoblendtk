use std::collections::HashMap;
use std::fs::File;
use std::io::BufReader;
use std::path::Path;
use ontolius::TermId;
use serde::Deserialize;

use crate::util::errors::PhenoblendError;
use crate::hpoa::disease_model::GeneDiseaseAssociation;


static OMIM_PREFIX: &str = "OMIM";


#[derive(Debug, Deserialize)]
struct RawGeneDiseaseRow {
    ncbi_gene_id: String,
    gene_symbol: String,
    association_type: String,
    disease_id: String, 
    source: String,
}

pub fn load_gene_disease_associations<P: AsRef<Path>>(
    fpath: P,
) -> Result<HashMap<String, Vec<GeneDiseaseAssociation>>, PhenoblendError> {
    let file = File::open(&fpath)
        .map_err(|_| PhenoblendError::io_error(format!("Could not open file: {:?}", fpath.as_ref())))?;
    let reader = BufReader::new(file);

    let mut tsv_reader = csv::ReaderBuilder::new()
        .delimiter(b'\t')
        .has_headers(true)
        .from_reader(reader);

    let mut association_map: HashMap<String, Vec<GeneDiseaseAssociation>> = HashMap::new();

    for result in tsv_reader.deserialize::<RawGeneDiseaseRow>() {
        let row = result.map_err(|e| {
            PhenoblendError::parse_error(format!("TSV deserialization failed: {}", e))
        })?;
        if !row.disease_id.starts_with(OMIM_PREFIX) {
            continue;
        }
        let disease_id: TermId = row.disease_id.parse().map_err(|e| {
            PhenoblendError::parse_error(format!(
                "Failed to parse OMIM disease_id '{}': {}", row.disease_id, e
            ))
        })?;
        // We will add the OMIM label for autocomplete searches later on, for now we set to None
        let record = GeneDiseaseAssociation {
            ncbi_gene_id: row.ncbi_gene_id,
            gene_symbol: row.gene_symbol.clone(),
            association_type: row.association_type,
            disease_id,
            disease_model: None,
            source: row.source,
        };

        // Use the entry API with a clone of the key to position the record in the vector
        association_map
            .entry(record.gene_symbol.clone())
            .or_default()
            .push(record);
    }

    Ok(association_map)
}