use std::collections::HashMap;
use std::fs::File;
use std::io::BufReader;
use std::path::Path;
use crate::errors::PhenoblendError;
use crate::hpoa::disease_model::GeneDiseaseAssociation;




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

    for result in tsv_reader.deserialize::<GeneDiseaseAssociation>() {
        let record = result.map_err(|e| {
            PhenoblendError::parse_error(format!("TSV deserialization failed: {}", e))
        })?;

        // Use the entry API with a clone of the key to position the record in the vector
        association_map
            .entry(record.gene_symbol.clone())
            .or_default()
            .push(record);
    }

    Ok(association_map)
}