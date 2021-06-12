const express = require('express');
const router = express.Router();

const keys = require('../config/keys');
const stripe = require('stripe')(keys.STRIPE_SK);


router.post('/create-account-link', async (req, res) => {
    const accountId = req.body.stripeAccountId;

    const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: 'http://localhost:3000/dashboard',
        return_url: 'http://localhost:3000/dashboard',
        type: 'account_onboarding',
    });

    res.status(200).send({body: accountLink});
});

router.post('/get-account-info', async (req, res) => {
    const accountId = req.body.stripeAccountId;

    const account = await stripe.accounts.retrieve(
        accountId
    );


    res.status(200).send({body: account});
});

router.post('/get-update-link', async (req, res) => {
    const accountId = req.body.stripeAccountId;

    const loginLink = await stripe.accounts.createLoginLink(
        accountId
    );

    res.status(200).send({body: loginLink});
});

router.post('/generate-report', async (req, res) => {
    const currentEpoch = Math.trunc(Date.now() / 1000);
    const yesterdayEpoch = currentEpoch - 86400;
    const weekAgoEpoch = yesterdayEpoch - 604800;

    const reportRun = await stripe.reporting.reportRuns.create({
        report_type: 'balance.summary.1',
        parameters: {
          interval_start: weekAgoEpoch,
          interval_end: yesterdayEpoch,
        },
    });

    let retrievedReportRun = await stripe.reporting.reportRuns.retrieve(
        reportRun.id
    );

    while(retrievedReportRun.status != "succeeded") {
        retrievedReportRun = await stripe.reporting.reportRuns.retrieve(
            reportRun.id
        );
    }
    
    console.log(retrievedReportRun);

    const fileLink = await stripe.fileLinks.create({
        file: retrievedReportRun.result.id,
    });

    console.log(fileLink);

    res.status(200).send({body: fileLink});
});

router.post('/get-transfers', async (req, res) => {

    var charges = [];
    let charge;

    const transfers = await stripe.transfers.list({
        destination: req.body.stripeAccountId,
        limit: 3,
    });

    console.log(transfers);

    for (const transfer of transfers.data) {
        charge = await stripe.charges.retrieve(transfer.source_transaction)
        charges.push(charge);
    }

    res.status(200).send({body: charges});
});

module.exports = router;