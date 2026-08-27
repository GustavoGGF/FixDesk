import threading

# Classe que gerencia a execução de threads, iniciando, executando e parando uma thread
class ThreadManager:
    # Inicializador da classe
    # target: função ou método que será executado pela thread
    # interval_seconds: intervalo (em segundos) entre execuções da função target (padrão 60 segundos)
    def __init__(self, target, interval_seconds=60):
        self.interval = interval_seconds  # Intervalo entre execuções da função target
        self.target = target  # Função que será executada na thread
        self.running = False  # Variável que controla se a thread está em execução
        self.thread = None  # Atributo que armazena a thread em execução
        self._lock = threading.Lock()  # Lock para garantir a segurança ao acessar e modificar variáveis compartilhadas

    # Inicia a thread se ela ainda não estiver em execução
    def start(self):
        with self._lock:  # Garante que a modificação de 'running' seja segura para concorrência
            if not self.running:  # Verifica se a thread não está em execução
                self.running = True  # Marca a thread como em execução
                self.thread = threading.Thread(target=self.run, daemon=True)  # Cria uma nova thread para a função run
                self.thread.start()  # Inicia a execução da thread

    # Função que executa a função target repetidamente no intervalo definido
    def run(self):
        while self.running:  # Enquanto a thread estiver em execução
            self.target()  # Chama a função target
            threading.Event().wait(self.interval)  # Aguarda o intervalo especificado antes de executar novamente

    # Para a execução da thread
    def stop(self):
        with self._lock:  # Garante que a modificação de 'running' seja segura para concorrência
            self.running = False  # Marca a thread como não executando
            if self.thread is not None:  # Verifica se a thread foi iniciada
                self.thread.join(timeout=5)  # Espera a thread terminar por até 5 segundos antes de forçar a finalização
                self.thread = None  # Define o atributo da thread como None após a conclusão
