use actix::{Actor, StreamHandler};
use actix_web::{web, App, HttpRequest, HttpResponse, HttpServer, Error};
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
            Ok(_) => {}, // Other message types (Ping/Pong/Close) can be handled here.
            Err(e) => {
                error!("WebSocket Protocol Error: {:?}", e);
                ctx.stop(); // Stop the WebSocket context on error
            },
        }
    }
}

async fn websocket_route(req: HttpRequest, stream: web::Payload) -> Result<HttpResponse, Error> {
    ws::start(MyWebSocket {}, &req, stream).map_err(|e| {
        error!("WebSocket Error: {:?}", e);
        e
    })
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    std::env::set_var("RUST_LOG", "actix_web=info"); // Set log level
    env_logger::init(); // Initialize logger
    
    info!("Starting server at http://127.0.0.1:8080...");
    
    HttpServer::new(|| {
        App::new()
            .route("/ws/", web::get().to(websocket_route))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}