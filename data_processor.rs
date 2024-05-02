use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::{BufReader, BufRead};
use csv::ReaderBuilder;
use std::collections::HashMap;
use std::env;
use sqlx::{Pool, Postgres, Any, AnyPool};

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
struct DataRecord {
}

fn read_csv_file(file_path: &str) -> Vec<DataRecord> {
    let file = File::open(file_path).expect("Cannot open file.");
    let mut csv_reader = ReaderBuilder::new().from_reader(file);
    csv_reader.deserialize()
        .filter_map(Result::ok)
        .collect()
}

fn read_json_file(file_path: &str) -> Vec<DataRecord> {
    let file = File::open(file_path).expect("Cannot open file.");
    let reader = BufReader::new(file);
    serde_json::from_reader(reader).expect("Error during reading JSON")
}

async fn read_from_database(query: &str) -> Result<Vec<DataRecord>, sqlx::Error> {
    let config = Config::from_env();
    let pool: AnyPool = AnyPool::connect(&config.database_url).await?;
    let result = sqlx::query_as::<Any, DataRecord>(query)
        .fetch_all(&pool)
        .await?;
    Ok(result)
}

fn calculate_mean(data: &[f64]) -> f64 {
    if data.is_empty() {
        0.0
    } else {
        data.iter().sum::<f64>() / data.len() as f64
    }
}

fn analyze_data(records: &[DataRecord]) {
    let mut occurrences = HashMap::new();

    for record in records {
    }
}

fn prepare_for_visualization(data: &[DataRecord]) -> Vec<DataRecord> {
    data.to_vec()
}