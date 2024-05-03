use actix_cors::Cors;
use actix_web::{middleware::Logger, web, App, HttpResponse, HttpServer, Responder};
use serde::{Deserialize, Serialize};
use std::env;

#[derive(Serialize, Deserialize)]
struct DataPoint {
    id: u32,
    value: String,
}

async fn get_processed_data() -> impl Responder {
    let data_samples = vec![
        DataPoint { id: 1, value: "Sample Data 1".into() },
        DataPoint { id: 2, value: "Sample Data 2".into() },
    ];

    HttpResponse::Ok().json(data_samples)
}

async fn query_specific_data(info: web::Path<u32>) -> impl Responder {
    let data_sample = DataPoint {
        id: *info,
        value: format!("Sample Data {}", *info),
    };

    HttpResponse::Ok().json(data_sample)
}

async fn real_time_data_updates() -> impl Responder {
    HttpResponse::Ok()
        .content_type("text/plain")
        .body("Placeholder for real-time data. Consider SSE or WebSocket.")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();
    env_logger::init();

    let server_url = env::var("SERVER_URL").unwrap_or_else(|_| "127.0.0.1:8080".to_string());

    HttpServer::new(move || {
        App::new()
            .wrap(Logger::default())
            .wrap(Cors::permissive())
            .service(
                web::scope("/api")
                    .route("/data", web::get().to(get_processed_data))
                    .route("/data/{id}", web::get().to(query_specific_data))
                    .route("/real-time", web::get().to(real_time_data_updates)),
            )
    })
    .bind(&server_url)?
    .run()
    .await
}