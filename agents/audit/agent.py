from uagents import Agent, Context
from .models import ESGReportInput, ESGReportResult
from .rules import record_transaction, aggregate_company_esg
from .report_generator import generate_esg_report

audit_agent = Agent(
    name="audit",
    seed="audit_seed_phrase",
    port=8010,
    endpoint=["http://127.0.0.1:8010/submit"],
)

@audit_agent.on_message(model=ESGReportInput)
async def handle_audit_input(ctx: Context, sender: str, msg: ESGReportInput):
    result = record_transaction(msg.company_name, msg.material_type, msg.quantity_kg, msg.contract_id)
    summary = aggregate_company_esg(result["history"])
    report_path = generate_esg_report(msg.company_name, summary, result["history"])

    response = ESGReportResult(
        company_name=msg.company_name,
        report_period_transactions=summary["total_transactions"],
        total_co2_saved_kg=summary["total_co2_saved_kg"],
        total_landfill_diverted_kg=summary["total_landfill_diverted_kg"],
        circularity_rating=summary["circularity_rating"],
        report_path=report_path,
    )
    ctx.logger.info(f"Audit report generated: {response}")
    await ctx.send(sender, response)

if __name__ == "__main__":
    audit_agent.run()