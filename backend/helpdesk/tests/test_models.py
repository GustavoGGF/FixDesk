from django.test import SimpleTestCase
from helpdesk.models import SupportTicket

class SupportTicketModelTests(SimpleTestCase):
    """
    Conjunto de testes para os métodos do modelo SupportTicket.
    """

    def test_to_dict_serialization(self):
        """
        Input:  Instância de SupportTicket com campos definidos
        Expect: Dicionário correspondente aos campos serializados e ID correto
        Result: verificado via assert
        """
        ticket = SupportTicket(
            id=42,
            ticketRequester="User Test",
            sector="TI",
            occurrence="Erro no sistema",
            problemn="Bug",
            open=True,
            PID=123
        )

        result = ticket.to_dict()

        expected_requester = "User Test"
        expected_sector = "TI"
        expected_id = 42

        assert result.get("ticketRequester") == expected_requester, (
            f"\n📥 Input:    ticketRequester={ticket.ticketRequester!r}"
            f"\n✅ Expected: {expected_requester!r}"
            f"\n❌ Got:      {result.get('ticketRequester')!r}"
        )
        assert result.get("sector") == expected_sector, (
            f"\n📥 Input:    sector={ticket.sector!r}"
            f"\n✅ Expected: {expected_sector!r}"
            f"\n❌ Got:      {result.get('sector')!r}"
        )
        assert result.get("id") == expected_id, (
            f"\n📥 Input:    id={ticket.id!r}"
            f"\n✅ Expected: {expected_id!r}"
            f"\n❌ Got:      {result.get('id')!r}"
        )
