<?php
class OpenAIClient {
    private string $apiKey;
    private string $model;

    public function __construct(string $apiKey, string $model) {
        $this->apiKey = $apiKey;
        $this->model = $model;
    }

    public function chat(string $question, array $history = []): array {
        $endpoint = 'https://api.openai.com/v1/chat/completions';

        $messages = [];
        $messages[] = ['role' => 'system', 'content' => OPENAI_SYSTEM_PROMPT];
        // Limita historial a últimos 6 turnos (usuario/bot) para no crecer sin control
        $trimmed = array_slice($history, -6);
        foreach ($trimmed as $h) {
            if (!isset($h['role'], $h['content'])) continue;
            $messages[] = [
                'role' => $h['role'] === 'user' ? 'user' : 'assistant',
                'content' => substr($h['content'], 0, 800)
            ];
        }
        $messages[] = ['role' => 'user', 'content' => $question];

        $payload = json_encode([
            'model' => $this->model,
            'messages' => $messages,
            'temperature' => 0.7,
            'max_tokens' => 450,
            'top_p' => 1.0,
            'frequency_penalty' => 0,
            'presence_penalty' => 0
        ]);

        $ch = curl_init($endpoint);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $this->apiKey,
                'Content-Type: application/json'
            ],
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_TIMEOUT => OPENAI_TIMEOUT
        ]);
        $raw = curl_exec($ch);
        $err = curl_error($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($err) {
            return ['ok' => false, 'error' => 'Error de red: ' . $err];
        }
        $data = json_decode($raw, true);
        if ($status >= 400) {
            $msg = $data['error']['message'] ?? 'Error HTTP ' . $status;
            return ['ok' => false, 'error' => $msg];
        }
        $answer = $data['choices'][0]['message']['content'] ?? null;
        if (!$answer) {
            return ['ok' => false, 'error' => 'Respuesta vacía del modelo'];
        }
        return ['ok' => true, 'answer' => $answer];
    }
}
