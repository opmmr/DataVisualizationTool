use actix_cors::Cors;
use actix_web::{middleware::Logger, web, App, HttpResponse, HttpServer, Responder, Result};
use serde::{Deserialize, Serialize};
use std::{env, fmt};

#[derive(Debug)]
enum DataError {
    NotFound(String),
    InternalServerError(String),
}

impl fmt::Display for DataError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            DataError::NotFound(ref cause) => write!(f, "Not Found: {}", cause),
            DataError::InternalServerError(ref cause) => write!(f, "Internal Server Error: {}", cause),
        }
    }
}

impl actix_web::error::ResponseError for DataError {
    fn error_response(&self) -> HttpResponse {
        match self {
            DataError::NotFound(ref _message) => HttpResponse::NotFound().json("Data not found"),
            DataError::InternalServerError(ref _message) => HttpResponse::InternalServerError().json("Internal server error"),
        }
    }
}

#[derive(Serialize, Deserialize)]
struct DataEntity {
    id: u32,
    value: String,
}

async fn fetch_all_data_points() -> Result<impl Responder, DataError> {
    let data_points = vec![
        DataEntity { id: 1, value: "Sample Data 1".into() },
        DataEntity { id: 2, value: "Sample Data 2".into() },
    ];

    if data_points.is_empty() {
        Err(DataError::InternalServerError(
            "Failed to process data".to_string(),
        ))
    } else {
        Ok(HttpResponse::Ok().json(data_points))
    }
}

async fn fetch_data_by_id(query_info: web::Path<u32>) -> Result<impl Responder, DataError> {
    let data_id = *query_info;

    if data_id <= 0 || data_id > 2 {
        Err(DataError::NotFound(format!("Data with id {} not found", data_id)))
    } else {
        let data_entity = DataEntity {
            id: data_id,
            value: format!("Sample Data {}", data_id),
        };

        Ok(HttpResponse::Ok().json(data_entity))
    }
}

async fn subscribe_to_real_time_updates() -> impl Responder {
    HttpResponse::Ok()
        .content_type("text/plain")
        .body("Placeholder for real-time data updates. Consider SSE or WebSocket implementation.")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();
    env_logger::init();

    let server_address = env::var("SERVER_URL").unwrap_or_else(|_| "127.0.0.1:8080".to_string());

    HttpServer::new(move || {
        App::new()
            .wrap(Logger::default())
            .wrap(Cors::permissive())
            .service(
                web::scope("/api")
                    .route("/data", web::get().to(fetch_all_data_points))
                    .route("/data/{id}", web::get().to(fetch_data_by_id))
                    .route("/updates", web::get().to(subscribe_to_real_time_updates)),
            )
    })
    .bind(&server_address)?
    .run()
    .await
}