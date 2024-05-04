use serde::{Deserialize, Serialize};
use std::{collections::HashMap, env, fs::File, io::BufReader};
use csv::ReaderBuilder;
use sqlx::{Any, AnyPool};
use once_cell::sync::OnceCell;

struct Config {
    database_url: String,
}

impl Config {
    fn from_env() -> Self {
        dotenv::dotenv().ok();
        let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
        Config { database_url }
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct DataRecord {}

fn read_csv_file(file_path: &str) -> Vec<DataRecord> {
    let file = File::open(file_path).expect("Cannot open file.");
    let mut csv_reader = ReaderBuilder::new().from_reader(file);
    csv_reader
        .deserialize()
        .filter_map(Result::ok)
        .collect()
}

fn read_json_file(file_path: &str) -> Vec<DataRecord> {
    let file = File::open(file_path).expect("Cannot open file.");
    let reader = BufReader::new(file);
    serde_json::from_reader(reader).expect("Error during reading JSON")
}

static DB_CACHE: OnceCell<HashMap<String, Vec<DataRecord>>> = OnceCell::new();

async fn read_from_database(query: &str) -> Result<Vec<DataRecord>, sqlx::Error> {
    let cache = DB_CACHE.get_or_init(|| HashMap::new());
    if let Some(result) = cache.get(query) {
        return Ok(result.clone());
    }

    let config = Config::from_env();
    let pool: AnyPool = AnyPool::connect(&config.database_url).await?;
    let result = sqlx::query_as::<Any, DataRecord>(query)
        .fetch_all(&pool)
        .await?;

    cache.insert(query.to_string(), result.clone());

    Ok(result)
}

static MEAN_CACHE: OnceCell<HashMap<Vec<f64>, f64>> = OnceCell::new();

fn calculate_mean(data: &[f64]) -> f64 {
    let cache = MEAN_CACHE.get_or_init(|| HashMap::new());
    if let Some(&mean) = cache.get(data) {
        return mean;
    }

    let mean = if data.is_empty() {
        0.0
    } else {
        data.iter().sum::<f64>() / data.len() as f64
    };

    cache.insert(data.to_vec(), mean);

    mean
}

fn analyze_data(records: &[DataRecord]) {
    let mut occurrences = HashMap::new();

    for record in records {
        // Analysis logic here
    }
}

fn prepare_for_visualization(data: &[DataRecord]) -> Vec<DataRecord> {
    data.to_vec()
}