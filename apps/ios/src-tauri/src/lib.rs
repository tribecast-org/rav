//! tribeMail iOS shell.
//!
//! The webview loads the *hosted* tribeMail web client (frontend + Rust
//! backend served from one origin) rather than a bundled static export. The
//! web client uses same-origin `/api` calls, `SameSite=Strict` session cookies
//! and a same-host WebSocket, so it only works when the page and the API share
//! an origin. See `apps/ios/README.md` for the full rationale.
//!
//! The URL is fixed at compile time via the `TRIBEMAIL_URL` env var.

use tauri::{WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_opener::OpenerExt;
use url::Url;

const DEFAULT_URL: &str = "https://tribemail.app";

fn app_url() -> Url {
    let raw = option_env!("TRIBEMAIL_URL")
        .filter(|s| !s.trim().is_empty())
        .unwrap_or(DEFAULT_URL);
    Url::parse(raw.trim()).unwrap_or_else(|e| panic!("TRIBEMAIL_URL {raw:?} is not a valid URL: {e}"))
}

/// Navigation stays in-app only for the tribeMail origin; everything else
/// (links inside emails, Fastmail's app-password page, …) opens in Safari.
fn is_in_app(target: &Url, home: &Url) -> bool {
    matches!(target.scheme(), "tauri" | "about" | "blob" | "data")
        || (target.scheme() == home.scheme()
            && target.host_str() == home.host_str()
            && target.port_or_known_default() == home.port_or_known_default())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let home = app_url();
            let handle = app.handle().clone();
            let nav_home = home.clone();

            let builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::External(home))
                .on_navigation(move |target| {
                    if is_in_app(target, &nav_home) {
                        return true;
                    }
                    let _ = handle.opener().open_url(target.as_str(), None::<&str>);
                    false
                });

            #[cfg(desktop)]
            let builder = builder.title("tribeMail").inner_size(1100.0, 760.0);

            builder.build()?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tribeMail");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn same_origin_stays_in_app() {
        let home = Url::parse("https://tribemail.app").unwrap();
        assert!(is_in_app(&Url::parse("https://tribemail.app/mail?x=1").unwrap(), &home));
        assert!(!is_in_app(&Url::parse("https://www.fastmail.com/").unwrap(), &home));
        assert!(!is_in_app(&Url::parse("http://tribemail.app/").unwrap(), &home));
        assert!(!is_in_app(&Url::parse("mailto:a@b.c").unwrap(), &home));
    }

    #[test]
    fn default_url_parses() {
        assert!(Url::parse(DEFAULT_URL).is_ok());
    }
}
