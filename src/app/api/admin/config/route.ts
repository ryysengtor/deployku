import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import Banner from '@/lib/models/Banner';
import Voucher from '@/lib/models/Voucher';
import Transaction from '@/lib/models/Transaction';
import { updateDemoTransaction } from '@/lib/demo-data';

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { action } = body;

    if (!action) {
      return Response.json(
        { success: false, error: 'Missing required field: action' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'addProduct': {
        const productData = body.data;
        if (!productData) {
          return Response.json({ success: false, error: 'Missing product data' }, { status: 400 });
        }
        result = await Product.create(productData);
        break;
      }

      case 'updateProduct': {
        const { id: productId, data: productUpdateData } = body;
        if (!productId || !productUpdateData) {
          return Response.json({ success: false, error: 'Missing product id or data' }, { status: 400 });
        }
        result = await Product.findByIdAndUpdate(productId, { $set: productUpdateData }, { new: true, runValidators: true });
        if (!result) {
          return Response.json({ success: false, error: 'Product not found' }, { status: 404 });
        }
        break;
      }

      case 'deleteProduct': {
        const { id: deleteProductId } = body;
        if (!deleteProductId) {
          return Response.json({ success: false, error: 'Missing product id' }, { status: 400 });
        }
        result = await Product.findByIdAndDelete(deleteProductId);
        if (!result) {
          return Response.json({ success: false, error: 'Product not found' }, { status: 404 });
        }
        break;
      }

      case 'addCategory': {
        const categoryData = body.data;
        if (!categoryData) {
          return Response.json({ success: false, error: 'Missing category data' }, { status: 400 });
        }
        result = await Category.create(categoryData);
        break;
      }

      case 'deleteCategory': {
        const { id: deleteCategoryId } = body;
        if (!deleteCategoryId) {
          return Response.json({ success: false, error: 'Missing category id' }, { status: 400 });
        }
        result = await Category.findByIdAndDelete(deleteCategoryId);
        if (!result) {
          return Response.json({ success: false, error: 'Category not found' }, { status: 404 });
        }
        break;
      }

      case 'addBanner': {
        const bannerData = body.data;
        if (!bannerData) {
          return Response.json({ success: false, error: 'Missing banner data' }, { status: 400 });
        }
        result = await Banner.create(bannerData);
        break;
      }

      case 'deleteBanner': {
        const { id: deleteBannerId } = body;
        if (!deleteBannerId) {
          return Response.json({ success: false, error: 'Missing banner id' }, { status: 400 });
        }
        result = await Banner.findByIdAndDelete(deleteBannerId);
        if (!result) {
          return Response.json({ success: false, error: 'Banner not found' }, { status: 404 });
        }
        break;
      }

      case 'addVoucher': {
        const voucherData = body.data;
        if (!voucherData) {
          return Response.json({ success: false, error: 'Missing voucher data' }, { status: 400 });
        }
        result = await Voucher.create(voucherData);
        break;
      }

      case 'deleteVoucher': {
        const { id: deleteVoucherId } = body;
        if (!deleteVoucherId) {
          return Response.json({ success: false, error: 'Missing voucher id' }, { status: 400 });
        }
        result = await Voucher.findByIdAndDelete(deleteVoucherId);
        if (!result) {
          return Response.json({ success: false, error: 'Voucher not found' }, { status: 404 });
        }
        break;
      }

      case 'confirmPayment': {
        const { id: txnId } = body;
        if (!txnId) {
          return Response.json({ success: false, error: 'Missing transaction id' }, { status: 400 });
        }
        try {
          result = await Transaction.findByIdAndUpdate(
            txnId,
            {
              $set: {
                status: 'success',
                paidAt: new Date(),
              },
            },
            { new: true }
          );
        } catch {
          // Try demo data
          result = updateDemoTransaction(txnId, { status: 'success', paidAt: new Date().toISOString() });
        }
        if (!result) {
          return Response.json({ success: false, error: 'Transaction not found' }, { status: 404 });
        }
        break;
      }

      default:
        return Response.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return Response.json({ success: true, data: result });
  } catch (error) {
    console.error('Error in admin config:', error);
    return Response.json(
      { success: false, error: 'Failed to process admin config' },
      { status: 500 }
    );
  }
}
