document.getElementById("linux-x64").addEventListener('click', () => getFile("denev-linux-x86_64.tar.gz"));
document.getElementById("linux-arm64").addEventListener('click', () => getFile("denev-linux-arm64.tar.gz"));
document.getElementById("mac-x64").addEventListener('click', () => getFile("denev-macos-x86_64.tar.gz"));
document.getElementById("mac-arm64").addEventListener('click', () => getFile("denev-macos-arm64.tar.gz"));
document.getElementById("windows-x64").addEventListener('click', () => getFile("denev-windows-x86_64.zip"));

async function getFile(fileName) {
    const res = await fetch("https://api.github.com/repos/everwinner64/denev-cli-website/releases/latest");
    if (!res.ok) return;
    const release = await res.json();
    const url = `https://github.com/everwinner64/denev-cli-website/releases/download/${release.tag_name}/${fileName.replace('denev-', `denev-${release.tag_name}-`)}`;
    window.location.href = url;
}

