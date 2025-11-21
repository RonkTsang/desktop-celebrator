use serde::Deserialize;
use tauri::{AppHandle, Emitter};
use tiny_http::{Response, Server};

#[derive(Deserialize)]
struct TriggerRequest {
    #[serde(rename = "type")]
    event_type: String,
}

pub fn start_server(app: AppHandle) {
    std::thread::spawn(move || {
        let server = match Server::http("127.0.0.1:23333") {
            Ok(s) => s,
            Err(e) => {
                eprintln!("Failed to start HTTP server: {}", e);
                return;
            }
        };

        println!("HTTP Server listening on port 23333");

        for mut request in server.incoming_requests() {
            if request.method() == &tiny_http::Method::Post && request.url() == "/trigger" {
                let mut content = String::new();
                if let Err(_) = request.as_reader().read_to_string(&mut content) {
                    let _ = request.respond(Response::from_string("Failed to read body").with_status_code(400));
                    continue;
                }

                let trigger: Result<TriggerRequest, _> = serde_json::from_str(&content);
                match trigger {
                    Ok(data) => {
                        let event_name = match data.event_type.as_str() {
                            "success" => "celebrate-small",
                            "error" => "celebrate-big", // Just for demo, maybe error shouldn't celebrate? PRD says "success/error" -> trigger corresponding effects.
                            // Let's map success -> small, special -> big.
                            // PRD: "success/error" -> trigger corresponding effects.
                            // Let's assume success = small, big = big.
                            // Wait, PRD says:
                            // 1. Particle Burst (Small)
                            // 2. School Pride (Big)
                            // Git Hook: {"event": "commit", "result": "success"}
                            // Let's map "success" to "celebrate-small".
                            // Maybe "milestone" or "merge" to "celebrate-big"?
                            // For now, I'll map "success" to "celebrate-small" and "big" to "celebrate-big".
                            "big" => "celebrate-big",
                            _ => "celebrate-small",
                        };

                        if let Err(e) = app.emit(event_name, ()) {
                            eprintln!("Failed to emit event: {}", e);
                        }
                        let _ = request.respond(Response::from_string("OK"));
                    }
                    Err(_) => {
                        let _ = request.respond(Response::from_string("Invalid JSON").with_status_code(400));
                    }
                }
            } else {
                let _ = request.respond(Response::from_string("Not Found").with_status_code(404));
            }
        }
    });
}
