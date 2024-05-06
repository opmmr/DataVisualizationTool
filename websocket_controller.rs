use actix::{Actor, StreamHandler};
use actix_web::{web, App, HttpRequest, HttpResponse, HttpServer, Error, middleware::Logger};
use actix_web_actors::ws;
use log::{error, info};

struct MyWebSocket;

impl Actor for MyWebSocket {
    type Context = ws::WebsocketContext<Self>;
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for MyWebSocket {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        match msg {
            Ok(ws::Message::Text(text)) => ctx.text(text),
            Ok(ws::Message::Binary(bin)) => ctx.binary(bin),
            Ok(_) => {}, // Handle other types of messages here (Ping/Pong/Close)
            Err(e) => {
                error!("WebSocket Protocol Error: {:?}", e);
                ctx.stop(); // Stop the WebSocket context on encountering a protocol error
            },
        }
    }
}

async fn websocket_route(req: HttpRequest, stream: web::Payload) -> Result<HttpResponse, Error> {
    ws::start(MyWebSocket {}, &req, stream).map_err(|e| {
        error!("WebSocket connection error: {:?}", e);
        actix_web::error::ErrorInternalServerError("Internal Server Error") // Provide a more user-friendly error message
    })
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    std::env::set_var("RUST_LOG", "actix_web=info"); // Set log level
    env_logger::init(); // Initialize logger
    
    // Enhance server initialization with Middleware for better request logging
    HttpServer::new(|| {
        App::new()
            .wrap(Logger::default()) // Add Logger middleware for better access logging
            .route("/ws/", web::get().to(websocket_route))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}