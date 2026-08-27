import time
import logging
from django.core.management.base import BaseCommand
from django.conf import settings
from database_pool.health_check import DatabaseHealthCheck

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Monitora a saúde do pool de conexões do banco de dados'

    def add_arguments(self, parser):
        parser.add_argument(
            '--interval',
            type=int,
            default=30,
            help='Intervalo de verificação em segundos (padrão: 30)'
        )
        parser.add_argument(
            '--db',
            type=str,
            default='default',
            help='Alias do banco de dados a monitorar (padrão: default)'
        )
        parser.add_argument(
            '--continuous',
            action='store_true',
            help='Executar continuamente até interrupção (Ctrl+C)'
        )

    def handle(self, *args, **options):
        interval = options['interval']
        db_alias = options['db']
        continuous = options['continuous']

        self.stdout.write(
            self.style.SUCCESS(
                f'✓ Iniciando monitor do pool para "{db_alias}" '
                f'(intervalo: {interval}s)\n'
            )
        )

        try:
            iteration = 0
            while True:
                iteration += 1
                timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
                
                self.stdout.write(f'\n[{iteration}] {timestamp}')
                self.stdout.write('-' * 60)
                
                status = DatabaseHealthCheck.check_pool_status(db_alias)
                
                health_indicator = (
                    self.style.SUCCESS('✓ HEALTHY')
                    if status['is_healthy']
                    else self.style.ERROR('✗ UNHEALTHY')
                )
                
                self.stdout.write(f'Status: {health_indicator}')
                self.stdout.write(f'Mensagem: {status["message"]}')
                self.stdout.write(f'Pool: {status["pool_status"]}')
                
                if not continuous:
                    break
                
                time.sleep(interval)

        except KeyboardInterrupt:
            self.stdout.write(
                self.style.WARNING('\n\n✓ Monitor encerrado pelo usuário')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'✗ Erro ao monitorar pool: {str(e)}')
            )
            return 1

        return 0
