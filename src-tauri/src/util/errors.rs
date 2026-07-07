use serde::Serialize;
use thiserror::Error;


#[derive(Error, Debug)]
pub enum PhenoblendError {
    #[error("HPOA error: {0}")]
    HpoaError(String),

    #[error("Could not find file.")]
    IoError(String), 

     #[error("Could not parse file.")]
    ParseError(String), 

    #[error("Requested clinical term '{0}' was not found.")]
    NotFound(String),
}

// Map how the error should look when it arrives as JSON in Angular
impl Serialize for PhenoblendError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        // Enforce a unified format for the frontend: { type: "...", message: "..." }
        use serde::ser::SerializeStruct;
        let mut state = serializer.serialize_struct("AppError", 2)?;
        
        let error_type = match self {
            PhenoblendError::HpoaError(_) => "HpoaError",
            PhenoblendError::IoError(_) => "Iorror",
            PhenoblendError::ParseError(_) => "ParseError",
            PhenoblendError::NotFound(_) => "NotFound",
        };
        
        state.serialize_field("type", error_type)?;
        state.serialize_field("message", &self.to_string())?;
        state.end()
    }
}

impl PhenoblendError {
    pub fn hpoa_load_error(fname: impl Into<String>) -> Self {
        PhenoblendError::HpoaError(format!("Could not load HPOA file at {}", fname.into()))
    }

      pub fn io_error(fname: impl Into<String>) -> Self {
        PhenoblendError::IoError(format!("Could not load file at {}", fname.into()))
    }


    pub fn missing_metadata(msg: impl Into<String>) -> Self {
        PhenoblendError::IoError(msg.into())
    }

    pub fn parse_error(msg: impl Into<String>) -> Self {
        PhenoblendError::ParseError(msg.into())
    }
}