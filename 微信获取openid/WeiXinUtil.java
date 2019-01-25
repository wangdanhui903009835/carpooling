package com.blueteam.base.util.weixin;

import com.blueteam.base.util.DiamondUtil;
import com.blueteam.base.util.ExceptionUtil;
import com.blueteam.entity.dto.BaseResult;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.config.RegistryBuilder;
import org.apache.http.conn.socket.ConnectionSocketFactory;
import org.apache.http.conn.socket.PlainConnectionSocketFactory;
import org.apache.http.conn.ssl.DefaultHostnameVerifier;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.BasicHttpClientConnectionManager;
import org.apache.http.params.CoreConnectionPNames;
import org.apache.http.ssl.SSLContexts;
import org.apache.http.util.EntityUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.dom4j.io.SAXReader;
import org.springframework.core.io.ClassPathResource;

import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.Charset;
import java.security.KeyStore;
import java.security.SecureRandom;
import java.util.*;

import static com.blueteam.base.constant.DiamondConstant.GLOBAL_DATA;
import static com.blueteam.base.constant.DiamondConstant.WX_DATA;

/**
 * ΢��֧��������  ΢�Ź��ں���Ȩ��ȡ��Ϣ��
 *
 * @author ' ' 2017��2��28��
 * @version 1.0
 * @since 1.0 2017��2��28��
 */
public class WeiXinUtil {
    

    /**
     * MD5ǩ����Կ
     *
     * @param text          ��Ҫǩ�����ַ���
     * @param key           ��Կ
     * @param input_charset �����ʽ
     * @return ǩ�����
     * @author  2017��2��28��
     * @version 1.0
     * @since 1.0 2017��2��28��
     */
    public static String sign(String text, String key, String input_charset) {
        text = text + key;
        return DigestUtils.md5Hex(getContentBytes(text, input_charset));
    }

    /**
     * ǩ���ַ���
     *
     * @param
     * @param sign          ǩ�����
     * @param
     * @param input_charset �����ʽ
     * @return ǩ�����
     */
    public static boolean verify(String text, String sign, String key, String input_charset) {
        text = text + key;
        String mysign = DigestUtils.md5Hex(getContentBytes(text, input_charset));
        if (mysign.equals(sign)) {
            return true;
        } else {
            return false;
        }
    }

    public static byte[] getContentBytes(String content, String charset) {
        if (charset == null || "".equals(charset)) {
            return content.getBytes();
        }
        try {
            return content.getBytes(charset);
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException("MD5ǩ�������г��ִ���,ָ���ı��뼯����,��Ŀǰָ���ı��뼯��:" + charset);
        }
    }

    /**
     * ����6λ��10λ����� param codeLength(����λ)
     *
     * @param codeLength
     * @return
     * @author 2017��2��28��
     * @version 1.0
     * @since 1.0 2017��2��28��
     */
    public static String createCode(int codeLength) {
        String code = "";
        for (int i = 0; i < codeLength; i++) {
            code += (int) (Math.random() * 9);
        }
        return code;
    }

    private static boolean isValidChar(char ch) {
        if ((ch >= '0' && ch <= '9') || (ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z'))
            return true;
        if ((ch >= 0x4e00 && ch <= 0x7fff) || (ch >= 0x8000 && ch <= 0x952f))
            return true;// �������ĺ��ֱ���
        return false;
    }


    /**
     * ��ȥ�����еĿ�ֵ��ǩ������
     *
     * @param sArray ǩ��������
     * @return ȥ����ֵ��ǩ�����������ǩ������
     * @author  2017��2��28��
     * @version 1.0
     * @since 1.0 2017��2��28��
     */
    public static Map<String, String> paraFilter(Map<String, String> sArray) {
        Map<String, String> result = new HashMap<String, String>();
        if (sArray == null || sArray.size() <= 0) {
            return result;
        }
        for (String key : sArray.keySet()) {
            String value = sArray.get(key);
            if (value == null || value.equals("") || key.equalsIgnoreCase("sign")
                    || key.equalsIgnoreCase("sign_type")) {
                continue;
            }
            result.put(key, value);
        }
        return result;
    }

    /**
     * ����������Ԫ�����򣬲����ա�����=����ֵ����ģʽ�á�&���ַ�ƴ�ӳ��ַ���
     *
     * @param params ��Ҫ���򲢲����ַ�ƴ�ӵĲ�����
     * @return ƴ�Ӻ��ַ���
     * @author  2017��2��28��
     * @version 1.0
     * @since 1.0 2017��2��28��
     */
    public static String createLinkString(Map<String, String> params) {
        List<String> keys = new ArrayList<String>(params.keySet());
        Collections.sort(keys);
        String prestr = "";
        for (int i = 0; i < keys.size(); i++) {
            String key = keys.get(i);
            String value = params.get(key);
            if (i == keys.size() - 1) {// ƴ��ʱ�����������һ��&�ַ�
                if (key.equals("total_fee")) {
                    prestr = prestr + key + "=" + mathRoundDouble(value);
                } else {
                    prestr = prestr + key + "=" + value;
                }
            } else {
                if (key.equals("total_fee")) {
                    prestr = prestr + key + "=" + mathRoundDouble(value) + "&";
                } else {
                    prestr = prestr + key + "=" + value + "&";
                }
            }
        }
        return prestr;
    }

    /**
     * �Ż�https�ӿ�
     *
     * @return
     * @author  2017��2��28��
     * @version 1.0
     * @since 1.0 2017��2��28��
     */
    public static String httpRequest(String requestUrl, String requestMethod, String outputStr) {
        // ����SSLContext
        StringBuffer buffer = null;
        try {
            URL url = new URL(requestUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod(requestMethod);
            conn.setDoOutput(true);
            conn.setDoInput(true);
            conn.connect();
            //����������д����
            if (null != outputStr) {
                OutputStream os = conn.getOutputStream();
                os.write(outputStr.getBytes("utf-8"));
                os.close();
            }
            // ��ȡ�������˷��ص�����
            InputStream is = conn.getInputStream();
            InputStreamReader isr = new InputStreamReader(is, "utf-8");
            BufferedReader br = new BufferedReader(isr);
            buffer = new StringBuffer();
            String line = null;
            while ((line = br.readLine()) != null) {
                buffer.append(line);
            }
        } catch (Exception e) {
            e.printStackTrace();
            logger.error(ExceptionUtil.stackTraceString(e));
        }
        if (buffer == null){
            return "";}
        return buffer.toString();
    }
    /**
     * �����Ĺ�������: �˿����
     *@methodName
      * @param: null
     *@return
     *@since 1.4.0
     *@author  2018/1/23 17:23
     *@modifier
     */
    public static  Map<String, String> refundHttpRequest(String requestUrl, String data,Integer payChannel)throws Exception{
        String mchId = WeiXinUtil.SMALL_MCH_ID;
        String certName = WeiXinUtil.SMALL_MCH_CERT;
        if(payChannel == 4){
            //��ҳ��֧��
            mchId = WeiXinUtil.WECHAT_MCH_ID;
            certName = WeiXinUtil.WECHAT_MCH_CERT;
        }
        //ָ����ȡ֤���ʽΪPKCS12
        org.springframework.core.io.Resource fileRource = new ClassPathResource(certName);
        InputStream instream = fileRource.getInputStream();
        KeyStore keyStore = KeyStore.getInstance("PKCS12");
        keyStore.load(instream, mchId.toCharArray());
        // ʵ������Կ�� & ��ʼ����Կ����
        KeyManagerFactory kmf = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
        kmf.init(keyStore, mchId.toCharArray());

        // ���� SSLContext
        SSLContext sslContext = SSLContext.getInstance("TLS");
        sslContext.init(kmf.getKeyManagers(), null, new SecureRandom());
        SSLConnectionSocketFactory sslConnectionSocketFactory = new SSLConnectionSocketFactory(
                sslContext,
                new String[]{"TLSv1"},
                null,
                new DefaultHostnameVerifier());

        BasicHttpClientConnectionManager connManager = new BasicHttpClientConnectionManager(
                RegistryBuilder.<ConnectionSocketFactory>create()
                        .register("http", PlainConnectionSocketFactory.getSocketFactory())
                        .register("https", sslConnectionSocketFactory)
                        .build(),
                null,
                null,
                null
        );

        HttpClient httpclient = HttpClientBuilder.create().setConnectionManager(connManager).build();
        try {
            // ������Ӧͷ��Ϣ
            HttpPost httpost = new HttpPost(requestUrl);
            //��������ʹ��䳬ʱʱ��
            RequestConfig requestConfig = RequestConfig.custom().setSocketTimeout(10000).setConnectTimeout(10000).build();
            httpost.setConfig(requestConfig);
            // ������Ϣʵ��
            StringEntity entitys = new StringEntity(data, "UTF-8");
            httpost.addHeader("Content-Type", "text/xml");
            httpost.setEntity(entitys);
            HttpResponse response = httpclient.execute(httpost);
            HttpEntity entity = response.getEntity();
            String jsonStr = EntityUtils.toString(entity, "UTF-8");
            System.out.println("�˿���"+jsonStr);
            return readStringXmlOut(jsonStr);
        } finally {
            instream.close();
        }
    }

    public static String urlEncodeUTF8(String source) {
        String result = source;
        try {
            result = java.net.URLEncoder.encode(source, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return result;
    }

    public static String mathRoundDouble(Object o) {
        Double d = Double.parseDouble(o.toString());
        if (Math.round(d) - d == 0D) {
            return String.valueOf(Math.round(d));
        }
        return String.valueOf(d);
    }
    /**
     * �����Ĺ�������: ��ʽ��xml
     *@methodName
     * @param: null
     *@return
     *@since 1.4.0
     *@author '' 2018/1/10 10:54
     *@modifier
     */
    public static String convertToXml(Object obj) {
        // ���������
        StringWriter sw = new StringWriter();
        try {
            // ����jdk���Դ���ת����ʵ��
            JAXBContext context = JAXBContext.newInstance(obj.getClass());
            Marshaller marshaller = context.createMarshaller();
            // ��ʽ��xml����ĸ�ʽ
            marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT,
                    Boolean.TRUE);
            // ������ת�����������ʽ��xml
            marshaller.marshal(obj, sw);
        } catch (JAXBException e) {
            e.printStackTrace();
        }
        return sw.toString();
    }
    /**
     * �����Ĺ�������: ��xmlת��Ϊmap
     *@methodName
     * @param: null
     *@return
     *@since 1.4.0
     *@author xiaojiang 2018/1/10 13:51
     *@modifier
     */
    public static Map<String,String> readStringXmlOut(String xml) {
        Map<String,String> map = new HashMap<>();
        try {
            // ���ַ���תΪXML
            Document doc = DocumentHelper.parseText(xml);
            // ��ȡ���ڵ�
            Element rootElt = doc.getRootElement();
            //��ȡ���ڵ������нڵ�
            List<Element> list = rootElt.elements();
            //�ڵ��nameΪmap��key��textΪmap��value
            for (Element element : list) {
                map.put(element.getName(), element.getText());
            }
        } catch (DocumentException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return map;
    }
}
