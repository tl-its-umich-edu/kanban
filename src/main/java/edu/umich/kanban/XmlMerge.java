package edu.umich.kanban;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.StringReader;
import java.io.StringWriter;
import java.io.Writer;
import java.util.ResourceBundle;

import java.net.URL;
import java.net.URLConnection;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.security.cert.X509Certificate;
import java.security.NoSuchAlgorithmException;
import java.security.KeyManagementException;
 
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Source;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;

import org.apache.commons.codec.binary.Base64;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import java.util.logging.Logger;

public class XmlMerge {

   ResourceBundle props = ResourceBundle.getBundle("jira");
   private static Log M_log = LogFactory.getLog(XmlMerge.class);
   
   /** Sakai JIRA is using RapidSSL which isn't currently trusted, so for now, we'll trust everyone
    **/
   static
   {
      // Create a trust manager that does not validate certificate chains
      TrustManager[] trustAllCerts = new TrustManager[] 
      {
         new X509TrustManager() {
            public java.security.cert.X509Certificate[] getAcceptedIssuers() {
               return null;
            }
            public void checkClientTrusted(X509Certificate[] certs, String authType) {
            }
            public void checkServerTrusted(X509Certificate[] certs, String authType) {
            }
         }
      };
      
      // Install the all-trusting trust manager
      try
      {
      SSLContext sc = SSLContext.getInstance("SSL");
      sc.init(null, trustAllCerts, new java.security.SecureRandom());
      HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
      }
      catch ( NoSuchAlgorithmException nsa )
      {
         M_log.debug(nsa);
      }
      catch (KeyManagementException km )
      {
         M_log.debug(km);
      }
      
      // Create all-trusting host name verifier
      HostnameVerifier allHostsValid = new HostnameVerifier() {
            public boolean verify(String hostname, SSLSession session) {
               return true;
            }
         };
      
      // Install the all-trusting host verifier
      HttpsURLConnection.setDefaultHostnameVerifier(allHostsValid);
   }
      
   /**
    ** Merge and transform the three JIRA XML file streams defined by the its.url and sakai.url and i2.url properties
    **
    ** @param queryString Additional query string from servlet
    ** @param xsltPath Input filepath of XSLT to transform xml into JSON
    ** @param xmlPath Output filepath of merged XML
    ** @returns String XML file transformed into JSON
    **/
   public String mergeFiles(String queryString, String xsltPath, String xmlPath) throws Exception {
      
      String its=queryJiraITS(queryString);
      String sakai = queryJiraSakai(queryString);
      String internet2 = queryJiraInternet2(queryString);
      
      // Build 3 Documents based on 3 JIRA RSS feeds queried above
      DocumentBuilderFactory domFactory = DocumentBuilderFactory
         .newInstance();
      domFactory.setIgnoringComments(true);
      DocumentBuilder builder = domFactory.newDocumentBuilder();
      Document doc = builder.parse(new InputSource(new StringReader(sakai)));
      Document docIts = builder.parse(new InputSource(new StringReader(its)));
      Document docInternet2 = builder.parse(new InputSource(new StringReader(internet2)));
      
      // Merge ITS JIRA nodes into Sakai (master) Doc
      NodeList nodesSakai = doc.getElementsByTagName("item");
      NodeList nodesIts = docIts.getElementsByTagName("item");
      for (int i = 0; i < nodesIts.getLength(); i++) {
         Node n = (Node) doc.importNode(nodesIts.item(i), true);
         nodesSakai.item(0).getParentNode().appendChild(n);
      }
      
      // Merge Internet2 JIRA nodes into Sakai (master) Doc
      NodeList nodesInternet2 = docInternet2.getElementsByTagName("item");
      for (int i = 0; i < nodesInternet2.getLength(); i++) {
         Node n = (Node) doc.importNode(nodesInternet2.item(i), true);
         nodesSakai.item(0).getParentNode().appendChild(n);
      }
      
      Transformer transformer = TransformerFactory.newInstance()
         .newTransformer();
      transformer.setOutputProperty(OutputKeys.INDENT, "yes");
      StreamResult result = new StreamResult(new StringWriter());
      DOMSource xmlSource = new DOMSource(doc);
      transformer.transform(xmlSource, result);
      
      Writer output = output = new BufferedWriter(new FileWriter(xmlPath));
      String xmlOutput = result.getWriter().toString();
      output.write(xmlOutput);
      output.close();
      
      // XSLT code - transform merged XMLfile into JSON
      TransformerFactory factory = TransformerFactory.newInstance();
      Source xsltSource = new StreamSource(new File(xsltPath));
      Transformer newTransformer = factory.newTransformer(xsltSource);
      StreamResult result1 = new StreamResult(new StringWriter());
      
      newTransformer.transform(xmlSource, result1);
      String jsonOutput = result1.getWriter().toString();
      return jsonOutput;
   }
   
   /**
    ** Query ITS JIRA instance
    **
    ** @param queryString Additional query string from servlet
    **/
   private String queryJiraITS(String queryUrlSuffix) throws Exception {
      
      String xmlFeed =props.getString("its.url"+queryUrlSuffix);
      String name =props.getString("its.username");
      String password = props.getString("its.password");
      String authString=name+":"+password;
      byte[] authEncBytes = Base64.encodeBase64(authString.getBytes());
      String authStringEnc = new String(authEncBytes);
      URL url = new URL(xmlFeed);
      URLConnection urlConnection = url.openConnection();
      urlConnection.setRequestProperty("Authorization", "Basic " + authStringEnc);
      InputStream is = urlConnection.getInputStream();
      InputStreamReader isr = new InputStreamReader(is);
      int numCharsRead;
      char[] charArray = new char[1024];
      StringBuffer sb = new StringBuffer();
      while ((numCharsRead = isr.read(charArray)) > 0) {
         sb.append(charArray, 0, numCharsRead);
      }
      String result = sb.toString();
      return result;
   }

   /**
    ** Query Sakai JIRA instance
    **
    ** @param queryString Additional query string from servlet (unused)
    **/
   private String queryJiraSakai(String queryUrlSuffix) throws Exception {
      
      String xmlFeed = props.getString("sakai.url"+queryUrlSuffix);
      URL url = new URL(xmlFeed);
      URLConnection urlConnection = url.openConnection();
      InputStream is = urlConnection.getInputStream();
      InputStreamReader isr = new InputStreamReader(is);
      int numCharsRead;
      char[] charArray = new char[1024];
      StringBuffer sb = new StringBuffer();
      while ((numCharsRead = isr.read(charArray)) > 0) {
         sb.append(charArray, 0, numCharsRead);
      }
      String result = sb.toString();
      return result;
      
   }
   
   /**
    ** Query Internet2 JIRA instance
    **
    ** @param queryString Additional query string from servlet
    **/
   private String queryJiraInternet2(String queryUrlSuffix) throws Exception {
      
      String xmlFeed = props.getString("i2.url"+queryUrlSuffix);
      URL url = new URL(xmlFeed);
      URLConnection urlConnection = url.openConnection();
      InputStream is = urlConnection.getInputStream();
      InputStreamReader isr = new InputStreamReader(is);
      int numCharsRead;
      char[] charArray = new char[1024];
      StringBuffer sb = new StringBuffer();
      while ((numCharsRead = isr.read(charArray)) > 0) {
         sb.append(charArray, 0, numCharsRead);
      }
      String result = sb.toString();
      return result;
      
   }
   
}
