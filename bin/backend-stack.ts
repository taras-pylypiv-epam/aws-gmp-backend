#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ProductServiceStack } from '../lib/product-service/product-service-stack';
import { ImportServiceStack } from '../lib/import-service/import-service-stack';

if (!process.env.EMAIL_SUB_BOOKS || !process.env.EMAIL_SUB_TOYS) {
  throw new Error('Missing required environment variables: EMAIL_SUB_BOOKS / EMAIL_SUB_TOYS');
}

const app = new cdk.App();

new ProductServiceStack(app, 'ProductServiceStack', {});
new ImportServiceStack(app, 'ImportServiceStack', {});
