import { StyleSheet } from "react-native";
import WebView from "react-native-webview";
import { colors } from "../constants/theme";

interface Props {
  handle: string;
}

function buildEmbedHtml(handle: string): string {
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">
    <style>body{margin:0;background:#f8fafc;font-family:-apple-system,sans-serif}</style></head>
    <body>
      <a class="twitter-timeline" data-height="480" data-theme="light" data-lang="fr" data-dnt="true"
         href="https://twitter.com/${handle}">Publications de @${handle} sur X</a>
      <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
    </body></html>`;
}

/** Native (iOS/Android) : le widget X s'affiche dans une WebView isolée. */
export default function LineEmbedBody({ handle }: Props) {
  return <WebView source={{ html: buildEmbedHtml(handle) }} style={styles.webview} />;
}

const styles = StyleSheet.create({
  webview: { height: 420, backgroundColor: "transparent" },
});
