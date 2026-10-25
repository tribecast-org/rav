fn main() {
    // Rebuild when the compiled-in backend URL changes.
    println!("cargo:rerun-if-env-changed=TRIBEMAIL_URL");
    tauri_build::build()
}
