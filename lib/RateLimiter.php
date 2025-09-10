<?php
class RateLimiter {
    private string $file;
    private int $limit;

    public function __construct(string $file, int $limit = 40) {
        $this->file = $file;
        $this->limit = $limit;
        if (!file_exists(dirname($file))) {
            @mkdir(dirname($file), 0775, true);
        }
    }

    public function allow(string $key): bool {
        $today = date('Y-m-d');
        $data = [];
        if (file_exists($this->file)) {
            $json = file_get_contents($this->file);
            $data = json_decode($json, true) ?: [];
        }
        if (!isset($data[$today])) {
            $data = [$today => []];
        }
        if (!isset($data[$today][$key])) {
            $data[$today][$key] = 0;
        }
        if ($data[$today][$key] >= $this->limit) {
            return false;
        }
        $data[$today][$key]++;
        file_put_contents($this->file, json_encode($data));
        return true;
    }
}
