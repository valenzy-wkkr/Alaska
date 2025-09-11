<?php
// Endpoint API /api/chat  (POST JSON: { question: string })
// Versión ampliada: limitación de peticiones, logging y base de conocimiento extendida.
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// ---- Configuración ----
$RATE_LIMIT = 10;          // máx peticiones
$RATE_WINDOW = 60;         // ventana en segundos
$MAX_ANSWER_LEN = 1000;    // seguridad
$LOG_ENABLED = true;

$rootDir = dirname(__DIR__, 2);
$logDir  = $rootDir . DIRECTORY_SEPARATOR . 'logs';
if (!is_dir($logDir)) {@mkdir($logDir, 0775, true);} // crear si no existe

// ---- Utilidades ----
function client_ip(){
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    // Opcional: ajustar para proxies (X-Forwarded-For) si se confía en cabeceras
    return $ip;
}

function rate_limited($ip, $limit, $window, $logDir){
    $safeIp = preg_replace('/[^a-z0-9_.-]/i', '_', $ip);
    $f = $logDir . DIRECTORY_SEPARATOR . 'chat_rate_' . $safeIp . '.json';
    $now = time();
    $data = [];
    if (file_exists($f)) {
        $raw = @file_get_contents($f);
        if ($raw) { $data = json_decode($raw, true) ?: []; }
    }
    // limpiar timestamps viejos
    $data = array_values(array_filter($data, function($ts) use($now,$window){ return ($now - (int)$ts) < $window; }));
    if (count($data) >= $limit) {
        return [true, $limit - count($data)];
    }
    $data[] = $now;
    @file_put_contents($f, json_encode($data), LOCK_EX);
    return [false, $limit - count($data)];
}

function log_interaction($logDir, $ip, $q, $a){
    $line = json_encode([
        'ts' => date('c'),
        'ip' => $ip,
        'q'  => $q,
        'a'  => mb_substr($a,0,300,'UTF-8')
    ], JSON_UNESCAPED_UNICODE);
    @file_put_contents($logDir . DIRECTORY_SEPARATOR . 'chatbot.log', $line . PHP_EOL, FILE_APPEND | LOCK_EX);
}

function json_exit($code, $payload){ http_response_code($code); echo json_encode($payload, JSON_UNESCAPED_UNICODE); exit; }

// ---- Entrada ----
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
$q = '';
if (is_array($data) && isset($data['question'])) $q = trim((string)$data['question']);
if ($q === '') json_exit(400, ['error' => 'Pregunta vacía']);

// ---- Rate limiting ----
[$limited, $remaining] = rate_limited(client_ip(), $RATE_LIMIT, $RATE_WINDOW, $logDir);
if ($limited) {
    json_exit(429, [
        'error' => 'Límite de peticiones alcanzado. Intenta nuevamente en un minuto.',
        'retry_after_seconds' => $RATE_WINDOW,
        'limit' => $RATE_LIMIT
    ]);
}

// ---- Motor de respuesta ----
function build_answer($q){
    $lower = mb_strtolower($q, 'UTF-8');

    $harmful = [
        '/matar|lastimar|herir|golpear|pegar|maltratar|abandonar|envenen|veneno|ahogar|asfixiar|electrocutar|castigo\s*f[ií]sico|tortura/i',
        '/hacer\s*daño|dañarlo|dañar\s*al\s*animal|estropear\s*al\s*animal/i',
        '/dopar|sedar\s*en\s*casa|droga/i'
    ];
    foreach ($harmful as $rx) if (preg_match($rx, $lower)) return ['category'=>'seguridad','text'=>'No puedo ayudar con acciones que dañen a los animales. Busca orientación profesional ética.'];

    $emergency = ['/convulsi[óo]n|no\s*respira|sangrado\s*abundante|fractura|envenen|veneno/i'];
    foreach ($emergency as $rx) if (preg_match($rx, $lower)) return ['category'=>'emergencia','text'=>'Posible emergencia. Mantén a tu mascota calmada y ve a un veterinario de urgencias inmediatamente.'];

    // Palabras clave que validan dominio
    $domainKW = ['perro','gato','mascota','animal','conejo','hurón','ave','pez','hamster','reptil','anfibio','veterin','vacuna','parásito','aliment','entren','adiestra','higiene','baño','uñas','pelo','ansiedad','enriquec','comport','garrapata','pulga','desparas','esteriliz','celo','cachorro','senior','diarrea','vómito','herida','zoonot','adopci','conserv','hábitat','habitat','ecosistema','extinci','respons','rescate'];
    $inDomain = false; foreach($domainKW as $w){ if(mb_strpos($lower,$w)!==false){ $inDomain=true; break; } }
    if(!$inDomain){
        return ['category'=>'fuera_dominio','text'=>'Respondo sobre cuidado, salud responsable, bienestar, ética y conocimientos generales de animales. Reformula tu pregunta enfocándola a ese ámbito.'];
    }

    // Base de conocimiento extendida (keywords, categoría, respuesta breve)
    $kb = [
        [['aliment','perro','cachorro'], 'alimentacion', 'Perros cachorro: 3-4 comidas pequeñas; transición a 2 comidas al llegar a ~6 meses. Usa alimento balanceado para etapa de crecimiento. Agua fresca siempre.'],
        [['aliment','perro','adulto'], 'alimentacion', 'Perro adulto: 2 tomas (mañana/noche). Ajusta ración por peso ideal y actividad. Evita sobrealimentación y muchos premios calóricos.'],
        [['aliment','gato','prote'], 'alimentacion', 'Gatos: alta proteína de calidad, mezcla seco + húmedo para hidratación. Evita cebolla, ajo, chocolate, uvas, alcohol, huesos cocidos.'],
        [['aliment','ave'], 'alimentacion', 'Aves: dieta específica por especie (semillas no basta). Incluye pellets formulados, verduras seguras y agua limpia; evitar chocolate, aguacate, cafeína.'],
        [['aliment','roedor','hamster','cobaya','conejo'], 'alimentacion', 'Roedores / Conejos: heno base (fibra), pellets de calidad y verduras seguras. Limitar frutas (azúcar). Agua siempre disponible.'],
        [['aliment','reptil'], 'alimentacion', 'Reptiles: muy variable (herbívoros, insectívoros, carnívoros). Control de temperatura y UVB esencial para digestión y metabolismo.'],
        [['vacuna','perro','calendario'], 'vacunacion', 'Perros: 6-8 sem (moquillo/parvo), 10-12 refuerzo, 14-16 refuerzo + rabia (según zona). Refuerzos anuales o según riesgo.'],
        [['vacuna','gato'], 'vacunacion', 'Gatos: trivalente de base, leucemia felina según riesgo, rabia donde es obligatoria. Refuerzos según pauta veterinaria (1-3 años).'],
        [['desparas','parásito','antipulgas','garrapata'], 'parasitologia', 'Control: antiparasitario externo (pipetas, collares, comprimidos) y desparasitación interna periódica. Frecuencia según producto y zona.'],
        [['higiene','baño','cepillado','uñas','oídos'], 'higiene', 'Higiene: cepillado según tipo de pelo, baño cada 3-6 sem con champú adecuado, corte de uñas sin llegar a la pulpa, limpieza de oídos si hay cerumen.'],
        [['ansiedad','enriquec','juego','socializ'], 'bienestar', 'Bienestar: juego diario, rompecabezas, socialización gradual, rutinas consistentes. Refuerzo positivo. Evitar castigos físicos.'],
        [['primeros auxilios','herida','diarrea','vómito','vomito'], 'primeros_auxilios', 'Primeros auxilios: mantener calma, evitar medicación humana, controlar hemorragias con presión suave. Si síntomas severos o >24h -> veterinario.'],
        [['signos alarma','letargo','sangrado','convulsion','convulsión'], 'alarma', 'Signos de alarma: letargo extremo, dificultad respiratoria, convulsiones, sangrado abundante, incapacidad para ponerse en pie -> urgencia veterinaria.'],
        [['zoonot','transmit'], 'zoonosis', 'Zoonosis: mantener vacunación, desparasitación y buena higiene. Lavado de manos tras manipular heces o reptiles. Evitar besos boca-nariz.'],
        [['esteriliz','castrac'], 'esterilizacion', 'Esterilización: reduce camadas no deseadas, ciertos tumores y conductas hormonales. Realizar bajo evaluación prequirúrgica.'],
        [['geriátr','senior','edad avanzada'], 'geriatria', 'Geriátricos: chequeos más frecuentes, dieta adaptada, control de dolor articular, estimulación mental suave y superficies antideslizantes.'],
        [['tox','alimento prohibido','chocolate','uva','medicamento'], 'toxicidad', 'Toxicidad: NO dar chocolate, uvas/pasas, xilitol, cebolla, ajo, alcohol, AINEs humanos. Ante ingestión, acudir rápido al veterinario.'],
        [['clasific','mamífero','reptil','anfibio','invertebrado'], 'general', 'Clasificación: mamíferos (pelaje, vivíparos), aves (plumas), reptiles (ectotermos escamas), anfibios (piel permeable), peces (branquias), invertebrados (sin columna).'],
        [['hábitat','habitat','selva','desierto','océano','oceano','bosque','sabana'], 'habitats', 'Hábitats: selva (alta biodiversidad), desierto (adaptación a agua limitada), océano (zonas con distinta luz), bosques y sabanas con redes tróficas específicas.'],
        [['adaptacion','camuflaje','hibernación','hibernacion','migracion','migración'], 'adaptaciones', 'Adaptaciones: camuflaje para evitar depredadores, hibernación ahorra energía, migraciones siguen recursos o clima favorable.'],
        [['carnívoro','herbívoro','omnivoro','omnivoro'], 'alimentacion_naturaleza', 'Alimentación natural: carnívoros (proteína animal), herbívoros (plantas/fibra), omnívoros (mixto). Cada grupo con anatomía digestiva especializada.'],
        [['peligro extinción','conserv','extincion'], 'conservacion', 'Conservación: amenazas principales incluyen pérdida de hábitat, caza ilegal y contaminación. Apoya programas de conservación acreditados.'],
        [['tenencia responsable','antes de adoptar'], 'responsabilidad', 'Tenencia responsable: evaluar tiempo, recursos, espacio, costos veterinarios y compromiso de años antes de adoptar.'],
        [['protección animal','leyes','derechos animales'], 'etica_legal', 'Protección animal: leyes prohíben maltrato y abandono. Denunciar abuso y promover cuidado humanitario.'],
        [['impacto humano','deforest','tráfico ilegal','trafico ilegal'], 'impacto', 'Impacto humano: deforestación, comercio ilegal y contaminación reducen biodiversidad. Consumir responsablemente y apoyar educación ambiental.'],
        [['educación ambiental','educacion ambiental'], 'educacion', 'Educación ambiental: fomenta respeto a fauna, reduce conflictos humano-fauna y promueve conservación sostenible.'],
        [['adopción','adopcion','compra','rescate'], 'adopcion', 'Adopción vs compra: rescatar reduce sobrepoblación y apoya refugios. Compra ética solo a criadores responsables y regulados.'],
        [['curiosidad','curiosidades','ballena azul'], 'curiosidades', 'Curiosidad: el corazón de una ballena azul puede pesar ~180 kg. Muchas especies poseen adaptaciones extremas para sobrevivir.'],
        [['récord','record','mas rápido','más rápido'], 'records', 'Récords: guepardo ~100 km/h, ballena de Groenlandia muy longeva (>200 años), colibrí abejilla de los más pequeños.'],
        [['animal extinto','dodo','tilacino'], 'extinciones', 'Extinciones: dodo (caza + especies invasoras), tilacino (caza y pérdida de hábitat). Prevención moderna es clave.'],
        [['mitología','historia','trabajo','compañía'], 'historia', 'Historia: animales han sido aliados en transporte, agricultura y mitología (ej. perros guardianes, gatos sagrados en Egipto).'],
        [['tendencias','medicina alternativa','apps','chip identificacion','chip'], 'tendencias', 'Tendencias: chips de identificación mejoran retorno; apps monitorean actividad; terapias alternativas deben complementarse con medicina basada en evidencia.' ],
    ];

    $bestScore = 0; $best = null;
    foreach($kb as $entry){
        [$keys,$cat,$resp] = $entry; $score=0; foreach($keys as $k){ if(mb_strpos($lower,$k)!==false) $score++; }
        if($score > $bestScore){ $bestScore=$score; $best=['category'=>$cat,'text'=>$resp]; }
    }
    if($best) return $best;
    return ['category'=>'generico','text'=>'Puedo orientar de forma general, pero diagnóstico/tratamiento exige evaluación veterinaria. Especifica especie, edad y tema para más precisión.'];
}

$res = build_answer($q);
$answer = $res['text'];
if (mb_strlen($answer,'UTF-8') > $MAX_ANSWER_LEN) $answer = mb_substr($answer,0,$MAX_ANSWER_LEN,'UTF-8');

if ($LOG_ENABLED) log_interaction($logDir, client_ip(), $q, $answer);

json_exit(200, [
    'answer' => $answer,
    'category' => $res['category'],
    'disclaimer' => 'Información educativa. No reemplaza evaluación veterinaria profesional.',
    'rate_limit_remaining' => $remaining
]);
