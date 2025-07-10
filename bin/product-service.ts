#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ProductServiceStack } from '../lib/product-service/product-service-stack';

new ProductServiceStack(new cdk.App(), 'ProductServiceStack', {});
